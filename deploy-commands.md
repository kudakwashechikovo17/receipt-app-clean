# Receipt App Deployment Commands

## 1. Deploy on Web01 and Web02

### On Web01:
```bash
# Pull the image
docker pull kudakwashe17/receipt-app:v1

# Run the container
docker run -d --name receipt-app --restart unless-stopped -p 8080:8080 kudakwashe17/receipt-app:v1

# Verify it's running
curl http://localhost:8080
```

### On Web02:
```bash
# Pull the image
docker pull kudakwashe17/receipt-app:v1

# Run the container
docker run -d --name receipt-app --restart unless-stopped -p 8080:8080 kudakwashe17/receipt-app:v1

# Verify it's running
curl http://localhost:8080
```

## 2. Configure Load Balancer (Lb01)

### Update HAProxy Configuration:
```bash
# Edit HAProxy config
sudo nano /etc/haproxy/haproxy.cfg
```

Add this backend configuration:
```
backend receipt_app
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check

frontend receipt_frontend
    bind *:80
    default_backend receipt_app
```

### Reload HAProxy:
```bash
# If using Docker HAProxy
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'

# Or if using system HAProxy
sudo systemctl reload haproxy
```

## 3. Test Load Balancer

### Test round-robin distribution:
```bash
for i in {1..10}; do
  curl -s http://LOAD_BALANCER_IP | grep -o "web-0[12]" || echo "Response $i"
done
```

### Check container status:
```bash
# On Web01 and Web02
docker ps
docker logs receipt-app
```

## 4. Access the Application

- **Direct access to Web01**: http://172.20.0.11:8080
- **Direct access to Web02**: http://172.20.0.12:8080  
- **Load balanced access**: http://LOAD_BALANCER_IP

## 5. Monitoring Commands

### Check container health:
```bash
docker exec receipt-app curl http://localhost:8080
```

### View logs:
```bash
docker logs -f receipt-app
```

### Container stats:
```bash
docker stats receipt-app
```