from fastapi import FastAPI
from pydantic import BaseModel
from agent.tinyfish_agent import run_job_agent
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 allow all (safe for hackathon)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔥 User Data Model
class UserData(BaseModel):
    name: str
    email: str
    phone: str
    linkedin: str
    resume: str

# 🔥 Request Model
class JobRequest(BaseModel):
    role: str
    location: str
    count: int
    user_data: UserData


@app.post("/apply-jobs")
async def apply_jobs(data: dict):
    role = data.get("role")
    location = data.get("location")
    count = data.get("count")
    user_data = data.get("user_data", {})
    demo_mode = data.get("demo_mode", True)   # 🔥 ADD THIS

    result = await run_job_agent(
        role, location, count, user_data, demo_mode
    )

    return {
        "status": "completed",
        "data": result["results"],
        "logs": result["logs"]
    }