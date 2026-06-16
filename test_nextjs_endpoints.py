import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        print("Testing Next.js dev server for /merchant/dashboard...")
        res = await client.get("http://localhost:3000/merchant/dashboard", follow_redirects=False, timeout=60.0)
        print(f"Response status: {res.status_code}")
        print(f"Response headers: {dict(res.headers)}")

asyncio.run(main())
