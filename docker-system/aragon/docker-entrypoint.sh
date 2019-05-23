#!/bin/sh

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

# Exit script as soon as a command fails.
replace_manifest_path() {
	file=$PWD/manifest.json
	output=$PWD/dist/manifest.json
	sed "s/dist\\///g" "$file" >"$output"
}

copy_assets() {
	mkdir -p dist/images && cp images/icon.svg dist/images/
}

deploy_contract() {
	# TODO: Are we sure we want to mute truffle output? we should discuss this maybe
	npx truffle compile >/dev/null
	deployed_at=$(npx truffle migrate --reset | tail -4 | head -1 | awk '{ print $NF }')
	echo "Deployed at:" "$deployed_at"
	published=$(npm run publish:http -- --contract "$deployed_at" | tail -2)
	echo "$published"
	replace_manifest_path
	copy_assets
	sleep 2
}

start_kit() {
	# Exit error mode so the testrpc and parallel parcel instances always gets killed
	set +e
	result=0
	npm run start:kit "$@"
	echo "Terminated, wait the cleaning up..."
	result=$?

	echo "Terminating testrpc..."
	kill -9 $testrpc_pid
	echo "Terminating parcel instances..."
	kill -9 $parallel_pid

	exit $result
}

echo "Compiling and getting deployed contract address"
node_modules/.bin/lerna exec --scope=@tps/apps-* --concurrency=1 -- deploy_contract
node_modules/.bin/lerna exec --scope=@tps/apps-* -- aragon apm versions

start_kit

exec "$@"