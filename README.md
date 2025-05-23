# MobileNet Image Classifier on Minikube

A web application that performs real-time image classification using MobileNet neural network, deployed on Minikube. This project demonstrates how to deploy a machine learning model with a modern web interface in a Kubernetes environment.

## Features

- Real-time image classification using MobileNet
- Drag-and-drop image upload interface
- Support for JPEG images
- File size validation (up to 5MB)
- Real-time prediction results display
- Kubernetes deployment using Minikube

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI Components

### Backend
- FastAPI
- Python
- MobileNet Model
- CORS support

### Infrastructure
- Minikube
- Kubernetes
- Docker

## Prerequisites

- Node.js (Latest LTS version)
- Python 3.x
- Minikube
- kubectl
- Docker

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yoel3imari/mobilenet-classifier-on-minikube.git
cd mobilenet-classifier-on-minikube
```

2. Start Minikube with sufficient resources:
```bash
minikube start --disk-size=12g --memory=4g
```

3. Enable Ingress addon
```bash
minikube addons enable ingress
```

4. Build and deploy services
```bash
eval $(minikube docker-env)

docker build -t yusef/mobilenet-backend:latest ./backend
docker build -t yusef/mobilenet-frontend:latest ./frontend

kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

kubectl apply -f k8s/ingress.yaml
```

5. Configure local DNS
```bash
echo "$(minikube ip) mobilenet.local" | sudo tee -a /etc/hosts
```

6. Verify deployment

Check `http://mobilenet.local` on your browser

```bash
kubectl get pods

kubectl get services

kubectl logs -l app=mobilenet-frontend
kubectl logs -l app=mobilenet-backend
```

## API Endpoints
- POST /predict : Upload an image for classification
  - Accepts: JPEG images up to 5MB
  - Returns: Array of predictions with labels and probabilities

- GET / : Health check endpoint


## Resource Requirements
The backend deployment is configured with the following resource limits:

- Memory: 1Gi (limit), 512Mi (request)
- CPU: 1 core (limit), 0.5 core (request)

## Monitoring
Monitor pod resource usage:

```bash
kubectl top pods
```

## Cleanup
To stop and delete the Minikube cluster:

```bash
minikube stop
minikube delete
```

## License
```
Copyright (c) 2025 yoel3imari
```
