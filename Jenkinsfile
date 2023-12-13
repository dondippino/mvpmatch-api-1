pipeline {
    agent { 
        label "docker-agent-node-alpine"
    }

    stages {
        stage("test") {
            steps {
                script {
                    echo 'Running tests...'
                    // Add your test steps here
                }
            }
        }

        stage("build") {
            steps {
                script {
                    echo 'Building...'
                    // Add your build steps here
                }
            }
        }
    }
}