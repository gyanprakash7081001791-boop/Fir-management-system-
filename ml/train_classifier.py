"""
ml/train_classifier.py
========================================================================
Script to train the TF-IDF & Naive Bayes model and save pickle artifacts.
Run: python3 ml/train_classifier.py
========================================================================
"""

import pickle
import os
from crime_classifier import TRAINING_DATA, CrimeAI

def train_and_export():
    print("[1/3] Initializing training data for FIR Crime Classification...")
    print(f"       Loaded {len(TRAINING_DATA)} labeled incident narratives.")
    
    ai = CrimeAI()
    os.makedirs("ml/models", exist_ok=True)
    
    model_path = "ml/models/fir_classifier.pkl"
    with open(model_path, "wb") as f:
        pickle.dump({"vectorizer": ai.vectorizer, "classifier": ai.classifier}, f)
    
    print(f"[2/3] Successfully trained model and exported to {model_path}.")
    
    # Test sample prediction
    test_text = "Someone broke into my jewelry shop at night by cutting the shutter lock."
    res = ai.predict_category(test_text)
    print("[3/3] Verification Sample Prediction:")
    print(f"       Input: '{test_text}'")
    print(f"       Predicted Category: {res['category']} (Confidence: {res['confidence']}%)")
    print(f"       IPC Section: {res['legal_sections']['ipc']}")
    print(f"       BNS Section: {res['legal_sections']['bns']}")
    print("Model Training & Validation Complete!")

if __name__ == "__main__":
    train_and_export()
