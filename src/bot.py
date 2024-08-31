from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from groq import Groq
import json

app = Flask(__name__)
CORS(app)

load_dotenv()

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

with open('../employee.jobs.json', 'r') as f:
    jobs = json.load(f)

with open('../mentors.json', 'r') as f:
    mentors = json.load(f)

with open('../resources.json', 'r') as f:
    resources = json.load(f)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data['message']
    
    job_context = "Available jobs:\n" + json.dumps(jobs, indent=2)
    mentor_context = "Available mentors:\n" + json.dumps(mentors, indent=2)
    resource_context = "Available resources:\n" + json.dumps(resources, indent=2)
    
    full_prompt = f"""
    Job Context:
    {job_context}

    Mentor Context:
    {mentor_context}

    Resource Context:
    {resource_context}

    User Query: {user_message}
    Don't hallucinate
    Determine if the user is asking about jobs, mentors, resources, or making a general query. 
    - If it's job-related, provide relevant job recommendations including details like company, title, salary, and deadline. 
    - If it's mentor-related, recommend suitable mentors based on their domain, experience, and availability. Only recommend mentors with availableForMentoring set to true and a rating of 4.0 or higher.
    - If it's resource-related, recommend relevant resources based on the field and type of resource the user is interested in and provide the url.
    - For general queries, respond naturally as a helpful assistant. 
    Always maintain a friendly and conversational tone behave like a human no automated replies.
    If the user isn't asking about jobs, mentors, or resources, don't recommend any this is the most important rule and you need to follow it.
    Search for key words in the user query and recommend jobs, mentors, or resources based on that.
    Use Indian rupees as currency for salary.
    """
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that can provide job recommendations based on available job data and engage in general conversation on various topics.",
            },
            {
                "role": "user",
                "content": full_prompt,
            }
        ],
        model="llama3-8b-8192",
        max_tokens=1000,
    )
    
    response = chat_completion.choices[0].message.content
    
    formatted_response = format_response(response)
    
    return jsonify({'response': formatted_response})

def format_response(response):
    paragraphs = response.split('\n\n')
    
    formatted_paragraphs = []
    for paragraph in paragraphs:
        if any(paragraph.startswith(prefix) for prefix in ["Company:", "Title:", "Salary:", "Deadline:", "Name:", "Domain:", "Role:", "Years of Experience:", "Email:", "Resource:"]):
            formatted_paragraphs.append(f"• {paragraph}")
        else:
            formatted_paragraphs.append(paragraph)
    
    return "\n\n".join(formatted_paragraphs)

if __name__ == '__main__':
    app.run(debug=True)
