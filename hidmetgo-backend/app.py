"""
OddJobs Backend API Server
Connects the mobile app to the Gemini AI agent
"""

import os
import json
from dotenv import load_dotenv

# Load environment variables FIRST before importing anything that needs them
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from app.hidmetgo_agent.agent import customer_agent, provider_agent

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
        mode = data.get('mode', 'customer') # 'customer' or 'provider'
        
        # Process through agent
        full_message = f"{context}\n{user_message}".strip()
        
        # Call the Groq agent
        try:
            if mode == 'provider':
                agent_response = provider_agent.generate_response(full_message, user_id=user_id)
                agent_name = provider_agent.name
                history = provider_agent.get_user_history(user_id)
            else:
                agent_response = customer_agent.generate_response(full_message, user_id=user_id)
                agent_name = customer_agent.name
                history = customer_agent.get_user_history(user_id)
            
            response = {
                'user_id': user_id,
                'request': user_message,
                'response': agent_response,
                'agent_name': agent_name,
                'history': history,
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


# Clear agent history endpoint (starts a fresh session)
@app.route('/api/agent/clear', methods=['POST'])
def clear_agent_history():
    """Clears the chat history of both agents to start a new chat session"""
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id') or request.args.get('user_id')
        customer_agent.clear_history(user_id)
        provider_agent.clear_history(user_id)
        return jsonify({
            'status': 'success',
            'message': 'Agent chat histories cleared successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500


# Get agent history endpoint
@app.route('/api/agent/history', methods=['GET'])
def get_agent_history():
    """Gets the active chat history of both agents"""
    try:
        mode = request.args.get('mode', 'customer')
        user_id = request.args.get('user_id', 'anonymous')
        if mode == 'provider':
            history = provider_agent.get_user_history(user_id)
        else:
            history = customer_agent.get_user_history(user_id)
        return jsonify({
            'status': 'success',
            'history': history
        }), 200
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
