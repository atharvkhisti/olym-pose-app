#!/bin/bash
# Jenkins Installation Script for Ubuntu 24.04
# Run this on your EC2 instance

set -e

echo "🚀 Installing Jenkins on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Java 17 (required for Jenkins)
echo "☕ Installing Java 17..."
sudo apt install -y openjdk-17-jdk

# Verify Java installation
java -version

# Add Jenkins repository
echo "📥 Adding Jenkins repository..."
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update

# Install Jenkins
echo "📦 Installing Jenkins..."
sudo apt install -y jenkins

# Start Jenkins service
echo "🔄 Starting Jenkins service..."
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to initialize..."
sleep 30

# Get initial admin password
echo ""
echo "✅ Jenkins installed successfully!"
echo ""
echo "📝 Initial Admin Password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo ""
echo "🌐 Access Jenkins at: http://13.233.133.240:8080"
echo ""
echo "⚠️  IMPORTANT: Configure firewall to allow port 8080"
echo "   Run: sudo ufw allow 8080"
echo ""
echo "📋 Next Steps:"
echo "1. Add inbound rule in AWS Security Group for port 8080"
echo "2. Access Jenkins at http://13.233.133.240:8080"
echo "3. Use the password above to unlock Jenkins"
echo "4. Install suggested plugins"
echo "5. Create admin user"
echo ""
