"""
Fine-Tuning Manager

Handles OpenAI model fine-tuning workflow:
1. Prepare training data from feedback
2. Upload to OpenAI
3. Trigger fine-tuning job
4. Monitor progress
5. Deploy fine-tuned model
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from openai import OpenAI
import time

class FineTuneManager:
    """Manages the complete fine-tuning lifecycle."""
    
    def __init__(self, api_key: str = None):
        """
        Initialize fine-tune manager.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)
        self.base_model = "gpt-4.1-mini"  # Manus-supported model
        
    def prepare_training_data(
        self,
        feedback_data: List[Dict],
        output_file: str = "training_data.jsonl"
    ) -> str:
        """
        Prepare training data in OpenAI fine-tuning format.
        
        Args:
            feedback_data: List of feedback records with corrections
            output_file: Path to save JSONL file
            
        Returns:
            Path to generated JSONL file
        """
        if len(feedback_data) < 100:
            raise ValueError(
                f"Need at least 100 examples for fine-tuning. Got {len(feedback_data)}. "
                "Collect more high-quality feedback first."
            )
        
        print(f"📝 Preparing {len(feedback_data)} training examples...")
        
        training_examples = []
        
        for record in feedback_data:
            # Create training example in chat format
            example = {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert resume parser. Extract structured information from resumes accurately."
                    },
                    {
                        "role": "user",
                        "content": f"Parse this resume and extract structured information:\n\n{record['resume_text']}"
                    },
                    {
                        "role": "assistant",
                        "content": json.dumps(record['corrected_data'], indent=2)
                    }
                ]
            }
            training_examples.append(example)
        
        # Write to JSONL file
        with open(output_file, 'w') as f:
            for example in training_examples:
                f.write(json.dumps(example) + '\n')
        
        print(f"✅ Training data saved to {output_file}")
        print(f"   Total examples: {len(training_examples)}")
        
        return output_file
    
    def upload_training_file(self, file_path: str) -> str:
        """
        Upload training file to OpenAI.
        
        Args:
            file_path: Path to JSONL training file
            
        Returns:
            File ID from OpenAI
        """
        print(f"📤 Uploading training file to OpenAI...")
        
        with open(file_path, 'rb') as f:
            response = self.client.files.create(
                file=f,
                purpose='fine-tune'
            )
        
        file_id = response.id
        print(f"✅ File uploaded successfully!")
        print(f"   File ID: {file_id}")
        
        return file_id
    
    def create_finetune_job(
        self,
        training_file_id: str,
        validation_file_id: Optional[str] = None,
        suffix: Optional[str] = None,
        hyperparameters: Optional[Dict] = None
    ) -> str:
        """
        Create a fine-tuning job.
        
        Args:
            training_file_id: OpenAI file ID for training data
            validation_file_id: Optional validation file ID
            suffix: Optional suffix for fine-tuned model name
            hyperparameters: Optional hyperparameters (n_epochs, batch_size, etc.)
            
        Returns:
            Fine-tune job ID
        """
        print(f"🚀 Creating fine-tuning job...")
        
        # Default hyperparameters
        if hyperparameters is None:
            hyperparameters = {
                "n_epochs": 3,  # Number of training epochs
                "batch_size": "auto",
                "learning_rate_multiplier": "auto"
            }
        
        # Create suffix if not provided
        if suffix is None:
            suffix = f"resume-parser-{datetime.now().strftime('%Y%m%d')}"
        
        # Create fine-tuning job
        job_params = {
            "training_file": training_file_id,
            "model": self.base_model,
            "suffix": suffix,
            "hyperparameters": hyperparameters
        }
        
        if validation_file_id:
            job_params["validation_file"] = validation_file_id
        
        response = self.client.fine_tuning.jobs.create(**job_params)
        
        job_id = response.id
        print(f"✅ Fine-tuning job created!")
        print(f"   Job ID: {job_id}")
        print(f"   Model: {self.base_model}")
        print(f"   Suffix: {suffix}")
        print(f"   Epochs: {hyperparameters['n_epochs']}")
        
        return job_id
    
    def monitor_finetune_job(self, job_id: str, poll_interval: int = 60) -> Dict:
        """
        Monitor fine-tuning job progress.
        
        Args:
            job_id: Fine-tune job ID
            poll_interval: Seconds between status checks
            
        Returns:
            Final job status
        """
        print(f"👀 Monitoring fine-tuning job: {job_id}")
        print(f"   Polling every {poll_interval} seconds...")
        print()
        
        while True:
            job = self.client.fine_tuning.jobs.retrieve(job_id)
            status = job.status
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Status: {status}")
            
            if status == "succeeded":
                print(f"\n🎉 Fine-tuning completed successfully!")
                print(f"   Fine-tuned model: {job.fine_tuned_model}")
                return {
                    "status": "succeeded",
                    "model_id": job.fine_tuned_model,
                    "job_id": job_id
                }
            
            elif status == "failed":
                print(f"\n❌ Fine-tuning failed!")
                print(f"   Error: {job.error}")
                return {
                    "status": "failed",
                    "error": job.error,
                    "job_id": job_id
                }
            
            elif status == "cancelled":
                print(f"\n⚠️  Fine-tuning was cancelled")
                return {
                    "status": "cancelled",
                    "job_id": job_id
                }
            
            # Still running, wait and check again
            time.sleep(poll_interval)
    
    def get_job_status(self, job_id: str) -> Dict:
        """
        Get current status of a fine-tuning job.
        
        Args:
            job_id: Fine-tune job ID
            
        Returns:
            Job status information
        """
        job = self.client.fine_tuning.jobs.retrieve(job_id)
        
        return {
            "job_id": job.id,
            "status": job.status,
            "model": job.model,
            "fine_tuned_model": job.fine_tuned_model,
            "created_at": job.created_at,
            "finished_at": job.finished_at,
            "trained_tokens": job.trained_tokens,
            "error": job.error if hasattr(job, 'error') else None
        }
    
    def list_finetune_jobs(self, limit: int = 10) -> List[Dict]:
        """
        List recent fine-tuning jobs.
        
        Args:
            limit: Maximum number of jobs to return
            
        Returns:
            List of job information
        """
        jobs = self.client.fine_tuning.jobs.list(limit=limit)
        
        return [
            {
                "job_id": job.id,
                "status": job.status,
                "model": job.model,
                "fine_tuned_model": job.fine_tuned_model,
                "created_at": job.created_at
            }
            for job in jobs.data
        ]
    
    def cancel_finetune_job(self, job_id: str) -> Dict:
        """
        Cancel a running fine-tuning job.
        
        Args:
            job_id: Fine-tune job ID
            
        Returns:
            Cancellation result
        """
        print(f"🛑 Cancelling fine-tuning job: {job_id}")
        
        job = self.client.fine_tuning.jobs.cancel(job_id)
        
        print(f"✅ Job cancelled: {job.status}")
        
        return {
            "job_id": job.id,
            "status": job.status
        }
    
    def run_complete_workflow(
        self,
        feedback_data: List[Dict],
        monitor: bool = True
    ) -> Dict:
        """
        Run the complete fine-tuning workflow.
        
        Args:
            feedback_data: Training data from feedback
            monitor: Whether to monitor job progress
            
        Returns:
            Final result with model ID
        """
        print("=" * 60)
        print("Starting Complete Fine-Tuning Workflow")
        print("=" * 60)
        print()
        
        # Step 1: Prepare training data
        print("Step 1: Preparing training data...")
        training_file = self.prepare_training_data(feedback_data)
        print()
        
        # Step 2: Upload to OpenAI
        print("Step 2: Uploading to OpenAI...")
        file_id = self.upload_training_file(training_file)
        print()
        
        # Step 3: Create fine-tuning job
        print("Step 3: Creating fine-tuning job...")
        job_id = self.create_finetune_job(file_id)
        print()
        
        # Step 4: Monitor progress (optional)
        if monitor:
            print("Step 4: Monitoring progress...")
            result = self.monitor_finetune_job(job_id)
            print()
            
            if result['status'] == 'succeeded':
                print("=" * 60)
                print("🎉 Fine-Tuning Complete!")
                print("=" * 60)
                print()
                print(f"Fine-tuned model ID: {result['model_id']}")
                print()
                print("Next steps:")
                print(f"1. Update OPENAI_MODEL_NAME={result['model_id']} in .env")
                print("2. Restart the application")
                print("3. Test parsing accuracy with new resumes")
                print("4. Monitor improvement in accuracy metrics")
                print()
                
            return result
        else:
            print("Step 4: Job created, monitoring skipped")
            print(f"   Use get_job_status('{job_id}') to check progress")
            print()
            
            return {
                "status": "created",
                "job_id": job_id,
                "training_file": training_file,
                "file_id": file_id
            }


# CLI interface
if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description="Manage OpenAI fine-tuning for resume parser")
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Create job command
    create_parser = subparsers.add_parser('create', help='Create fine-tuning job')
    create_parser.add_argument('--feedback-file', required=True, help='Path to feedback data JSON')
    create_parser.add_argument('--monitor', action='store_true', help='Monitor job progress')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Check job status')
    status_parser.add_argument('job_id', help='Fine-tune job ID')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List recent jobs')
    list_parser.add_argument('--limit', type=int, default=10, help='Number of jobs to show')
    
    # Cancel command
    cancel_parser = subparsers.add_parser('cancel', help='Cancel running job')
    cancel_parser.add_argument('job_id', help='Fine-tune job ID')
    
    args = parser.parse_args()
    
    manager = FineTuneManager()
    
    if args.command == 'create':
        # Load feedback data
        with open(args.feedback_file, 'r') as f:
            feedback_data = json.load(f)
        
        result = manager.run_complete_workflow(feedback_data, monitor=args.monitor)
        print(json.dumps(result, indent=2))
        
    elif args.command == 'status':
        status = manager.get_job_status(args.job_id)
        print(json.dumps(status, indent=2))
        
    elif args.command == 'list':
        jobs = manager.list_finetune_jobs(limit=args.limit)
        print(json.dumps(jobs, indent=2))
        
    elif args.command == 'cancel':
        result = manager.cancel_finetune_job(args.job_id)
        print(json.dumps(result, indent=2))
        
    else:
        parser.print_help()

