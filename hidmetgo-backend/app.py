"""
OddJobs Backend API Server
Connects the mobile app to the Gemini AI agent
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from app.hidmetgo_agent.agent import root_agent

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for mobile app requests

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'OddJobs Backend API',
        'version': '1.0.0'
    }), 200


# Process user request through AI agent
@app.route('/api/agent/process', methods=['POST'])
def process_request():
    """
    Process user request through the AI agent
    
    Expected JSON:
    {
        "message": "user message here",
        "user_id": "optional user id",
        "context": "optional context"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Missing required field: message'
            }), 400
        
        user_message = data.get('message')
        user_id = data.get('user_id', 'anonymous')
        context = data.get('context', '')
        
        # Process through agent
        full_message = f"{context}\n{user_message}".strip()
        
        # Call the Google Gemini agent
        try:
            # The agent will process the message and return a response
            agent_response = root_agent.generate_response(full_message)
            
            response = {
                'user_id': user_id,
                'request': user_message,
                'response': agent_response,
                'agent_name': root_agent.name,
                'status': 'success'
            }
        except Exception as agent_error:
            response = {
                'user_id': user_id,
                'request': user_message,
                'response': 'Unable to process request',
                'error': str(agent_error),
                'status': 'error'
            }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500


# Hire craftsman endpoint
@app.route('/api/hire/search', methods=['POST'])
def search_craftsmen():
    """
    Search for craftsmen by category
    
    Expected JSON:
    {
        "category": "plumbing|electrical|carpentry|etc",
        "location": "optional location",
        "user_id": "user id"
    }
    """
    try:
        data = request.get_json()
        category = data.get('category')
        location = data.get('location', 'current')
        user_id = data.get('user_id', 'anonymous')
        
        if not category:
            return jsonify({'error': 'Category required'}), 400
        
        # TODO: Query database for craftsmen in this category
        # For MVP, return mock data
        response = {
            'category': category,
            'location': location,
            'craftsmen': [
                {
                    'id': '1',
                    'name': 'Ahmed Ali',
                    'category': category,
                    'rating': 4.8,
                    'price': '$50-100',
                },
                {
                    'id': '2',
                    'name': 'Hassan Khan',
                    'category': category,
                    'rating': 4.6,
                    'price': '$45-90',
                }
            ]
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Find work endpoint
@app.route('/api/work/listings', methods=['GET'])
def get_work_listings():
    """
    Get available job listings
    
    Query params:
    ?category=category_name
    ?user_id=user_id
    """
    try:
        category = request.args.get('category', 'all')
        user_id = request.args.get('user_id', 'anonymous')
        
        # TODO: Query database for jobs
        # For MVP, return mock data
        response = {
            'category': category,
            'total_jobs': 2,
            'jobs': [
                {
                    'id': '1',
                    'title': 'Fix bathroom plumbing',
                    'category': 'plumbing',
                    'budget': '$100-150',
                    'location': 'Downtown',
                    'description': 'Need to fix leaking sink',
                },
                {
                    'id': '2',
                    'title': 'Paint bedroom wall',
                    'category': 'painting',
                    'budget': '$80-120',
                    'location': 'Midtown',
                    'description': 'Repaint bedroom in blue',
                }
            ]
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Submit service request
@app.route('/api/request/create', methods=['POST'])
def create_request():
    """
    Create a new service request
    
    Expected JSON:
    {
        "type": "hire|find_work",
        "category": "service category",
        "description": "detailed description",
        "budget": "estimated budget",
        "user_id": "user id"
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ['type', 'category', 'description', 'user_id']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # TODO: Save to database
        # For MVP, just return success
        response = {
            'request_id': 'REQ_12345',
            'status': 'created',
            'type': data.get('type'),
            'category': data.get('category'),
            'message': 'Request created successfully'
        }
        
        return jsonify(response), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile"""
    user_id = request.args.get('user_id', 'anonymous')
    
    response = {
        'user_id': user_id,
        'name': 'User Name',
        'email': 'user@example.com',
        'rating': 4.5,
        'completed_jobs': 5
    }
    
    return jsonify(response), 200


if __name__ == '__main__':
    # Development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
