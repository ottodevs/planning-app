install:
	docker-compose -f docker-system/docker-compose.yml run --rm workspace npm i

dev:
	docker-compose -f docker-system/docker-compose.yml up dev

clean:
	docker volume rm nodemodules

update:
	docker-compose -f docker-system/docker-compose.yml run --rm workspace npm update

workspace:
	docker-compose -f docker-system/docker-compose.yml run --rm workspace bash

rebuild:
	docker-compose -f docker-system/docker-compose.yml build

