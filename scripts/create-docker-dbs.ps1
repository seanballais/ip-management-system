Write-Output "⚒️ Creating the auth service database schemas..."
docker compose exec -it auth python ./scripts/create-db.py

Write-Output "⚒️ Creating the IP service database schemas..."
docker compose exec -it ip python ./scripts/create-db.py

Write-Output "🎉 Done!"
