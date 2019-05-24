#!/bin/bash

testrpc_port=8545


start_testrpc() {
	if [ "$RESET" = true ]; then
		echo "RESET=true -> Will delete ~/.aragon folder ctrl+c to abort now" && sleep 2
		rm -rf ~/.aragon
		npx aragon devchain --reset &
	else
		npx aragon devchain --port "$testrpc_port" &
	fi

	testrpc_pid=$!
}

echo "Starting our own testrpc instance at port $testrpc_port"
start_testrpc
sleep 15
npm run publish:http
start_kit
npm run start:kit

exec "$@"