setup:
	docker volume create nodemodules

install:
	docker-compose -f docker-system/docker-compose.builder.yml run --rm install

dev:
	docker-compose -f docker-system/docker-compose.yml up