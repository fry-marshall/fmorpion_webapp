prod:
	docker pull frymarshall/fmorpion_webapp && docker compose -f docker-compose.prod.yml up -d

push-image:
	docker build -t fmorpion_webapp -f Dockerfile . && docker tag fmorpion_webapp frymarshall/fmorpion_webapp:latest && docker push frymarshall/fmorpion_webapp:latest 
