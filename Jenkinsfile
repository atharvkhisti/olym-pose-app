pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_USERNAME = 'atharvkhisti'
        IMAGE_WEB = "${DOCKER_REGISTRY}/${DOCKER_USERNAME}/olym-pose-web"
        IMAGE_AI = "${DOCKER_REGISTRY}/${DOCKER_USERNAME}/olym-pose-ai"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Build Web Image') {
            steps {
                echo '🔨 Building Web Docker image...'
                script {
                    sh """
                        docker build -f docker/web.Dockerfile \
                            -t ${IMAGE_WEB}:latest \
                            -t ${IMAGE_WEB}:${GIT_COMMIT_SHORT} \
                            .
                    """
                }
            }
        }
        
        stage('Build AI Image') {
            steps {
                echo '🔨 Building AI Docker image...'
                script {
                    sh """
                        docker build -f docker/ai.Dockerfile \
                            -t ${IMAGE_AI}:latest \
                            -t ${IMAGE_AI}:${GIT_COMMIT_SHORT} \
                            .
                    """
                }
            }
        }
        
        stage('Push Images') {
            steps {
                echo '📤 Pushing images to registry...'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'github-container-registry',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo "\$DOCKER_PASS" | docker login ${DOCKER_REGISTRY} -u "\$DOCKER_USER" --password-stdin
                            docker push ${IMAGE_WEB}:latest
                            docker push ${IMAGE_WEB}:${GIT_COMMIT_SHORT}
                            docker push ${IMAGE_AI}:latest
                            docker push ${IMAGE_AI}:${GIT_COMMIT_SHORT}
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                echo '🚀 Deploying to production...'
                script {
                    sh """
                        cd /home/ubuntu/olym-pose-app
                        docker compose -f docker-compose.prod.yml pull
                        docker compose -f docker-compose.prod.yml up -d
                        docker compose -f docker-compose.prod.yml ps
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Checking application health...'
                script {
                    sh """
                        sleep 10
                        curl -f http://localhost:3000/api/health || exit 1
                        curl -f http://localhost:8001/health || exit 1
                    """
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old images...'
                script {
                    sh """
                        docker image prune -f
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
        always {
            echo '📊 Pipeline execution completed'
        }
    }
}
