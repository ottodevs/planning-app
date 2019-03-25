#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

if [ "$SOLIDITY_COVERAGE" = true ]; then
	testrpc_port=8555
else
	testrpc_port=8545
fi

testrpc_running() {
	nc -z localhost "$testrpc_port"
}

start_testrpc() {
	if [ "$SOLIDITY_COVERAGE" = true ]; then
		testrpc-sc -i 16 --gasLimit 0xfffffffffff --port "$testrpc_port" >/dev/null &
	elif [ "$TRUFFLE_TEST" = true ]; then
		ganache-cli -i 15 --gasLimit 50000000 --port "$testrpc_port" >/dev/null &
	elif [ "$START_KIT" = true ]; then
		aragon devchain --port "$testrpc_port" &
	elif [ "$RESTART_KIT" = true ] || [ "$CYPRESS" = true ]; then
		rm -rf ~/.ipfs
		aragon devchain --reset --port "$testrpc_port" &
	elif [ "$DEV" = true ]; then
		aragon devchain --port "$testrpc_port" &
		lerna run dev --parallel --scope=@tps/apps-* &
	elif [ "$RESET" = true ]; then
		aragon devchain --reset --port "$testrpc_port" &
		lerna run dev --parallel --scope=@tps/apps-* &
	fi

	testrpc_pid=$!
}

if testrpc_running; then
	echo "Killing testrpc instance at port $testrpc_port"
	kill -9 "$(lsof -i:"$testrpc_port" -sTCP:LISTEN -t)"
fi

echo "Starting our own testrpc instance at port $testrpc_port"
start_testrpc
sleep 5

# Exit error mode so the testrpc instance always gets killed
set +e
result=0
if [ "$SOLIDITY_COVERAGE" = true ]; then
	solidity-coverage "$@"
	result=$?
elif [ "$TRUFFLE_TEST" = true ]; then
	truffle test --network rpc "$@" | grep -v 'Compiling'
	result=$?
elif [ "$START_KIT" = true ] || [ "$RESTART_KIT" = true ]; then
	yarn publish:apps && yarn start:kit "$@"
	result=$?
elif [ "$DEV" = true ]; then
	yarn publish:http && yarn start:kit "$@"
	result=$?
elif [ "$CYPRESS" = true ]; then
	yarn publish:apps && yarn start:kit &> /dev/null &
	yarn cypress:run
	result=$?
	kill -9 "$(lsof -i:3000 -sTCP:LISTEN -t)" # kill parcel dev server
	kill -9 "$(lsof -i:8080 -sTCP:LISTEN -t)" # kill IPFS daemon
fi

kill -9 $testrpc_pid

exit $result
