#!/bin/sh
start_multi_parcel() {
	npx lerna run dev --log-level=silent --parallel "$@"
	parallel_pid=$!
}

echo "Starting multi parcel instances in parallel execution"
start_multi_parcel "$@"
sleep 10

kit_running() {
	nc -z localhost "3000"
}

if kit_running; then
	echo "Killing kit instance at port 3000"
	kill -9 "$(lsof -i:'3000' -t)"
fi


exec "$@"