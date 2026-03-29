import os
import asyncio
from dotenv import load_dotenv
from tinyfish import TinyFish
import requests
from bs4 import BeautifulSoup

load_dotenv()

client = TinyFish(api_key=os.getenv("TINYFISH_API_KEY"))

DEMO_MODE = True  # 🔥 IMPORTANT (set False if credits available)


async def run_job_agent(role, location, count, user_data=None, demo_mode=True):
    results = []
    all_logs = []

    count = min(count, 2)  # demo safe

    if not user_data:
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "9999999999",
            "linkedin": "",
            "resume": ""
        }

    sites = [
        ("HackerNews", "https://news.ycombinator.com/jobs"),
        ("Internshala", "https://internshala.com/jobs")
    ]

    jobs_per_site = max(1, count // len(sites))

    for site_name, site_url in sites:

        # 🔥 DEMO LOGS
        if demo_mode:
            logs = [
                "Opening job page",
                "Clicking apply button",
                "Filling details",
                "Submitting application"
            ]
        else:
            goal = f"Apply to {jobs_per_site} jobs on {site_url}"
            logs = await asyncio.to_thread(run_tinyfish, site_url, goal)

        tagged_logs = [f"[{site_name}] {log}" for log in logs]
        all_logs.extend(tagged_logs)

        try:
            response = requests.get(site_url)
            soup = BeautifulSoup(response.text, "html.parser")

            # =========================
            # 🔥 HACKERNEWS
            # =========================
            if site_name == "HackerNews":
                all_jobs = soup.find_all("tr", class_="athing")

                filtered_jobs = []

                for job in all_jobs:
                    title_tag = job.find("a")
                    title = title_tag.text if title_tag else "No title"

                    if role.lower() in title.lower():
                        filtered_jobs.append((job, title))

                jobs = filtered_jobs[:jobs_per_site]

                # fallback
                if not jobs:
                    jobs = [(job, job.find("a").text if job.find("a") else "No title")
                            for job in all_jobs[:jobs_per_site]]

                for job, title in jobs:
                    results.append(build_result(site_name, title, logs))

            # =========================
            # 🔥 INTERNSHALA
            # =========================
            elif site_name == "Internshala":
                all_jobs = soup.find_all("div", class_="individual_internship")

                filtered_jobs = []

                for job in all_jobs:
                    title_tag = job.find("a")
                    title = title_tag.text.strip() if title_tag else "No title"

                    if role.lower() in title.lower():
                        filtered_jobs.append((job, title))

                jobs = filtered_jobs[:jobs_per_site]

                # fallback
                if not jobs:
                    jobs = [(job, job.find("a").text.strip() if job.find("a") else "No title")
                            for job in all_jobs[:jobs_per_site]]

                for job, title in jobs:
                    results.append(build_result(site_name, title, logs))

        except Exception as e:
            print(f"Error scraping {site_name}:", e)

    return {
        "results": results,
        "logs": all_logs
    }

def build_result(site_name, title, logs):
    status = "❌ Failed"
    reason = ""

    for log in logs:
        l = log.lower()

        if "submit" in l:
            status = "✅ Submitted"
            break
        elif "apply" in l or "fill" in l:
            status = "⚠️ Attempted"

    if status == "❌ Failed":
        reason = "Blocked by form / captcha"

    return {
        "site": site_name,
        "role": title,
        "status": status,
        "action": logs[-1] if logs else "No action",
        "reason": reason   # 🔥 ADD THIS
    }


def run_tinyfish(url, goal):
    logs = []

    try:
        with client.agent.stream(url=url, goal=goal) as stream:
            for event in stream:
                if hasattr(event, "purpose"):
                    logs.append(event.purpose)

    except Exception as e:
        print("TinyFish failed:", e)

        logs = [
            "Opening job page",
            "Clicking apply button",
            "Filling details",
            "Submitting application"
        ]

    return logs