import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


CHROMA_DIR = os.getenv("CHROMA_DIR", "vector_db")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "cpu")  # use 'cuda' if GPU available


def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": EMBEDDING_DEVICE},
    )


def _collection_name(job_id: str) -> str:
    """Return a ChromaDB collection name scoped to a specific meeting/job."""
    return f"meeting_{job_id}"


def build_vector_store(transcript: str, job_id: str) -> Chroma:
    """Chunk transcript, embed, and persist to ChromaDB under a job-scoped collection."""
    print(f"Building vector store for job {job_id}...")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    chunks = splitter.split_text(transcript)

    docs = [
        Document(page_content=chunk, metadata={"chunk_index": i, "job_id": job_id})
        for i, chunk in enumerate(chunks)
    ]

    embeddings = get_embeddings()
    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=_collection_name(job_id),
        persist_directory=CHROMA_DIR,
    )

    print(f"Vector store built: {len(chunks)} chunks.")
    return vector_store


def load_vector_store(job_id: str) -> Chroma:
    """Load an existing persisted ChromaDB collection for a given job."""
    embeddings = get_embeddings()
    vector_store = Chroma(
        collection_name=_collection_name(job_id),
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR,
    )
    return vector_store


def get_retriever(vector_store: Chroma, k: int = 4):
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )