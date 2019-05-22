#!/bin/sh

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

