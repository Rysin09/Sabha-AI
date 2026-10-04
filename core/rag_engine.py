import os
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from core.vector_store import build_vector_store, load_vector_store, get_retriever


def get_llm():
    return ChatMistralAI(
        model="mistral-small-latest",
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        temperature=0.3,
    )


def format_docs(docs):
    return "\n\n".join([doc.page_content for doc in docs])


def _build_prompt():
    return ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an expert meeting assistant. Answer the user's question \
based ONLY on the meeting transcript context provided below.

If the answer is not found in the context, say: \
"I could not find this information in the meeting transcript."

Always be concise and precise. If quoting someone, mention it clearly.

Context from meeting transcript:
{context}""",
        ),
        ("human", "{question}"),
    ])


def build_rag_chain(transcript: str, job_id: str):
    """Build and persist the RAG vector store for a meeting, return the LCEL chain."""
    vector_store = build_vector_store(transcript, job_id)
    retriever = get_retriever(vector_store, k=4)
    llm = get_llm()
    prompt = _build_prompt()

    rag_chain = (
        {
            "context": retriever | RunnableLambda(format_docs),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain


def load_rag_chain(job_id: str):
    """Load an existing persisted RAG chain for a meeting."""
    vector_store = load_vector_store(job_id)   # BUG FIX: was calling get_retriever() with no args
    retriever = get_retriever(vector_store, k=4)
    llm = get_llm()
    prompt = _build_prompt()

    rag_chain = (
        {
            "context": retriever | RunnableLambda(format_docs),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain


def ask_question(rag_chain, question: str) -> str:
    """Invoke the RAG chain and return a plain string answer."""
    print(f"Question: {question}")
    answer = rag_chain.invoke(question)
    print(f"Answer: {answer}")
    return answer


def ask_question_with_sources(job_id: str, question: str) -> dict:
    """
    Load the RAG chain for a job, run the query, and return both the answer
    and the source document chunks used to answer it.

    Returns:
        {
            "answer": str,
            "sources": [
                {"chunk_index": int, "content": str},
                ...
            ]
        }
    """
    vector_store = load_vector_store(job_id)
    retriever = get_retriever(vector_store, k=4)

    # Retrieve source docs separately so we can return them
    source_docs = retriever.invoke(question)

    # Format context for the LLM
    context = format_docs(source_docs)
    llm = get_llm()
    prompt = _build_prompt()

    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})

    sources = [
        {
            "chunk_index": doc.metadata.get("chunk_index", i),
            "content": doc.page_content,
        }
        for i, doc in enumerate(source_docs)
    ]

    return {"answer": answer, "sources": sources}