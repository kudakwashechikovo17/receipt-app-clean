# Receipt Management System with AI Text Extraction

A modern web application that allows users to upload receipt images and extract text using Amazon Textract AI. Built with React and AWS Amplify.

## 🚀 Features

- **Receipt Upload**: Upload receipt images (JPEG, PNG, GIF)
- **AI Text Extraction**: Uses Amazon Textract to extract text from receipts
- **Search & Filter**: Search receipts by filename or extracted text
- **Sort Options**: Sort by date, name, status, or confidence score
- **Status Filtering**: Filter by processing status (Pending, Processed, Failed)
- **Delete Functionality**: Remove unwanted receipts
- **Real-time Updates**: Auto-refresh dashboard every 3 seconds
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Technology Stack

- **Frontend**: React 18, AWS Amplify UI Components
- **Backend**: AWS Amplify (GraphQL API, DynamoDB)
- **Storage**: Amazon S3
- **AI Processing**: Amazon Textract
- **Authentication**: AWS Cognito
- **Deployment**: Docker, Nginx

## 📋 Prerequisites

- Node.js 18+
- AWS Account with credits
- Docker (for deployment)
- Git

## 🔧 Local Development

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd receipt-app-clean
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure AWS
Ensure your `src/aws-exports.js` is properly configured with your AWS resources.

### 4. Run Locally
```bash
npm start
```
Application will be available at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t <dockerhub-username>/receipt-app:v1 .
```

### Test Locally
```bash
docker run -p 8080:8080 <dockerhub-username>/receipt-app:v1
curl http://localhost:8080
```

### Push to Docker Hub
```bash
docker login
docker push <dockerhub-username>/receipt-app:v1
```

## 🌐 Server Deployment

### Deploy on Web Servers
```bash
# On web-01 and web-02
docker pull <dockerhub-username>/receipt-app:v1
docker run -d --name receipt-app --restart unless-stopped -p 8080:8080 <dockerhub-username>/receipt-app:v1
```

### Configure Load Balancer (HAProxy)
Update `/etc/haproxy/haproxy.cfg`:
```
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

Reload HAProxy:
```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

## 🔑 API Integration

### Amazon Textract
- **Purpose**: Extract text from receipt images
- **Endpoint**: AWS Textract DetectDocumentText API
- **Cost**: ~$0.0015 per page processed
- **Documentation**: [AWS Textract Docs](https://docs.aws.amazon.com/textract/)

### AWS Amplify GraphQL API
- **Purpose**: Store receipt metadata and extracted text
- **Authentication**: AWS Cognito User Pools
- **Database**: Amazon DynamoDB

## 🎯 User Interaction Features

1. **Upload & Process**
   - Drag & drop or click to upload
   - File validation (type, size)
   - Real-time processing status

2. **Search & Filter**
   - Search by filename or extracted text
   - Filter by processing status
   - Sort by multiple criteria

3. **Data Management**
   - View extracted text with confidence scores
   - Delete unwanted receipts
   - Auto-refresh for real-time updates

## 🛡 Security Features

- AWS Cognito authentication
- Secure API key handling (not exposed in code)
- Input validation and sanitization
- HTTPS enforcement
- Security headers in nginx config

## 🚨 Error Handling

- Network connectivity issues
- API rate limiting
- File upload failures
- Authentication errors
- Invalid file formats
- Processing timeouts

## 📊 Testing Load Balancer

Test round-robin distribution:
```bash
for i in {1..10}; do
  curl -s http://localhost | grep -o "web-0[12]" || echo "Response $i"
done
```

## 💡 Performance Optimizations

- Gzip compression enabled
- Image optimization recommendations
- Caching for API responses
- Lazy loading for large datasets
- Debounced search functionality

## 🔮 Future Enhancements

- Receipt categorization
- Expense reporting
- OCR accuracy improvements
- Mobile app version
- Bulk upload functionality

## 📝 Credits

- **Amazon Textract**: AI-powered text extraction
- **AWS Amplify**: Backend infrastructure
- **React**: Frontend framework
- **Docker**: Containerization platform

## 🐛 Known Issues

- Large files (>10MB) may timeout
- Processing time varies with image complexity
- Requires stable internet connection

## 📞 Support

For issues or questions, please check the AWS documentation or contact the development team.

---

**Note**: This application uses AWS services that may incur charges. Monitor your AWS billing dashboard regularly.