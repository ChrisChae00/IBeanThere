from fastapi import FastAPI

app = FastAPI(title="IBeanThere API")


@app.get("/health")
def health_check():
    return {"status": "ok"}
