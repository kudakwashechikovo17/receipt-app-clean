# LINK TO YOUTUBE : https://youtu.be/wGQ5cDriLRc

# Earthsafe Management System Receipt Management System with AI Text Extraction

I created Earthsafe Management System Receipt Management System tht uses Amazon AI Text Extraction, application that allows users to upload receipt images and extract text using Amazon Textract AI. Built with React and AWS Amplify.

## The Main Features
This app lets you upload receipt images, automatically extract text using AI (Amazon Textract), search and filter by content or status, sort results, delete receipts, and view real-time updates — all from a responsive, user-friendly dashboard.


## 🛠 Technology Stack

- Frontend React 18, AWS Amplify UI Components
- Backend AWS Amplify (GraphQL API, DynamoDB)
- Storage Amazon S3
- AI Processing Amazon Textract
- Authentication: AWS Cognito
- Deployment Docker, Nginx




## 🐳 Docker Deployment
 Build Docker Image
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
 Extract text from receipt images
AWS Textract DetectDocumentText API
~$0.0015 per page processed [AWS Textract Docs](https://docs.aws.amazon.com/textract/)

### AWS Amplify GraphQL API
- Purpose: Store receipt metadata and extracted text
- Authentication: AWS Cognito User Pools
- Database: Amazon DynamoDB

## 🎯 User Interaction Features

 Upload & Process
   - Drag & drop or click to upload
   - File validation (type, size)
   - Real-time processing status

 **Data Management**
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

## Test Update
This is a test update to verify GitHub sync.
