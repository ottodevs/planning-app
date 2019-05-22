#!/bin/sh

# Exit script as soon as a command fails.

testrpc_port=8545


start_testrpc() {
	if [ "$RESET" = true ]; then
		echo "RESET=true -> Will delete ~/.aragon folder ctrl+c to abort now" && sleep 2
		rm -rf ~/.aragon
		node_modules/.bin/aragon devchain --reset
	else
		node_modules/.bin/aragon devchain --port "$testrpc_port"
	fi

	testrpc_pid=$!
}

echo "Starting our own testrpc instance at port $testrpc_port"
start_testrpc

exec "$@"