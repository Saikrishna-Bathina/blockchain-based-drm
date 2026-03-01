FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
# We reuse the root requirements or create a specific one? 
# Usually, it's better to have a specific one, but for now we'll copy it from the parent if needed.
# Since I'm creating this in imageFiles/, I should check if there's a requirements.txt there.
# Based on list_dir, there isn't. I'll use the one from root but filtered or just the root one.
COPY ../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8081
CMD ["python", "main.py"]
