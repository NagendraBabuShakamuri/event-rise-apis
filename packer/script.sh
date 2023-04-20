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

sudo yum install yum install git -y

git clone https://github.com/nagavenkateshgavini/eventrise.git

cd eventrise

npm install

cd ..

pwd

unzip event-rise-apis.zip -d event-rise-apis

rm event-rise-apis.zip

cd event-rise-apis/

npm install

cd ..

sudo chmod 755 event-rise-apis

sudo chmod 755 eventrise

ls -al

sudo mkdir -p /var/log/info6150/ && sudo touch /var/log/info6150/event-rise.log

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
                      "file_path": "/var/log/info6150/event-rise.log",
                      "log_group_name": "info6150",
                      "log_stream_name": "event-rise"
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

sudo chown ec2-user /var/log/info6150/event-rise.log

sudo yum install amazon-cloudwatch-agent -y