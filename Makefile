install:
	docker-compose -f docker-system/docker-compose.yml run --rm workspace npm i

dev:
	docker-compose -f docker-system/docker-compose.yml up aragon suite

update:
	docker-compose -f docker-system/docker-compose.yml run --rm workspace npm update

workspace:
	docker-compose -f docker-system/docker-compose.yml run --rm workspace bash

rebuild:
	docker-compose -f docker-system/docker-compose.yml build

