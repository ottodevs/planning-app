setup:
	docker volume create nodemodules --opt type=tmpfs --opt device=tmpfs --opt o=uid=1000,gid=1000

install:
	docker-compose -f docker-system/docker-compose.builder.yml run --rm install

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

