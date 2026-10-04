from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import os


def get_llm():

    return ChatMistralAI(model = "mistral-small-latest", mistral_api_key = os.getenv("MISTRAL_API_KEY"), temperature = 0.3)

def split_transcript(transcript : str) -> list:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 4000,
        chunk_overlap = 200,
    )

    return splitter.split_text(transcript)


def summarize(transcript : str) ->str:

    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful assistant that summarizes portions of transcripts concisely."),
            ("human", "{text}"),
        ]
    )

    map_chain = prompt | llm | StrOutputParser()

    chunks = split_transcript(transcript)

    chunk_summaries = [map_chain.invoke({"text":chunk}) for chunk in chunks]

    combined = "\n\n".join(chunk_summaries)

    combined_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are an expert meeting summarizer. Combine these partial summaries into one final professional meeting summary in bullet points."),
            ("human", "{text}"),
        ]
    )

    combined_chain = (
        RunnablePassthrough() | RunnableLambda(lambda x: {"text": x}) | combined_prompt | llm | StrOutputParser()
    )

    return combined_chain.invoke({"text": combined})


def generate_title(transcript : str)-> str:

    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are an expert meeting summarizer. Generate a catchy title for the meeting based on the transcript."),
            ("human", "Generate a title for this transcript:\n\n{transcript}"),
        ]
    )

    title_chain = RunnablePassthrough() | RunnableLambda(lambda x: {"text": x}) | prompt | llm | StrOutputParser()
    return title_chain.invoke(transcript[:2000])
    



    
    

