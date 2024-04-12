#!make

install:
	@npm install
	@cd pulumi && npm install

format:
	@npm run graphql-codegen
	@npm run prettier-format
	@npm run lint

build:
ifeq ("$(wildcard dist/router/bootstrap)","")
	@echo "Downloading router bootstrap..."
	@mkdir -p dist/router
	@wget https://github.com/wundergraph/cosmo/releases/download/aws-lambda-router%400.7.0/bootstrap-aws-lambda-router@0.7.0-linux-amd64.tar.gz -O dist/router/bootstrap.tar.gz
	@cd dist/router && tar -xf bootstrap.tar.gz && rm bootstrap.tar.gz && rm LICENSE
else
	@echo "Router bootstrap found."
endif
	@npm run graphql-codegen
	@npm run build

deploy:
	@cd pulumi && pulumi up

.PHONY: format
.PHONY: build
