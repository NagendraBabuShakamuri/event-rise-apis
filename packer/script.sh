#!/bin/bash

echo "Running the bash script.."

sudo yum update -y

sudo yum upgrade -y

sudo amazon-linux-extras install epel -y

sudo wget https://rpmfind.net/linux/epel/7/x86_64/Packages/l/libuv-1.44.2-1.el7.x86_64.rpm

sudo rpm -i libuv-1.44.2-1.el7.x86_64.rpm

sudo yum install nodejs -y

sudo yum install npm -y

node -v

npm -v

pwd

unzip webapp.zip -d webapp-main

rm webapp.zip

cd webapp-main/

npm install

cd ..

sudo chmod 755 webapp-main

ls -al

sudo mkdir -p /var/log/csye6225/ && sudo touch /var/log/csye6225/webapp.log

sudo cat >> cloudwatch-config.json << 'EOF'
{
  "agent": {
      "metrics_collection_interval": 10,
      "logfile": "/var/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
      "logs_collected": {
          "files": {
              "collect_list": [
                  {
                      "file_path": "/var/log/csye6225/webapp.log",
                      "log_group_name": "csye6225",
                      "log_stream_name": "webapp"
                  }
              ]
          }
      },
      "log_stream_name": "cloudwatch_log_stream"
  },
  "metrics":{
    "metrics_collected":{
       "statsd":{
          "service_address":":8125",
          "metrics_collection_interval":10,
          "metrics_aggregation_interval":60
       }
    }
 }
}
EOF

sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/

sudo mv "cloudwatch-config.json" "/opt/aws/amazon-cloudwatch-agent/etc/"

sudo chown ec2-user /var/log/csye6225/webapp.log

sudo yum install amazon-cloudwatch-agent -y