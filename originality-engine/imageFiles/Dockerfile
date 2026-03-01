FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY imageFiles/ .
EXPOSE 8081
CMD ["python", "main.py"]
