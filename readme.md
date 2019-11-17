# Hyperledger Fabric Demo - Cart Parts Inventory Tracking

## Get started
The following setup is tested on Ubuntu 16.04.6:
- Don't use root user, the dependency @ampretia/x509 would complain about permissions
- Install node version 8.x.x with npm version 5.x.x
- Install docker and docker-compose
- Install **hurley** via `npm i -g @worldsibu/hurley`
- Verify that hurley is ready to go by running `hurl --version`

### Clean docker environment
- Run `docker container ls` to check if there are containers running
- Clean up with: `docker rm -f $(docker ps -aq)`

### Setup predefined network topology
- The desired participants are defined in `demo-network.json`, place this file in `/root`
- Run `hurl new -n demo-network.json` in `/root`
- The command will download the hyperledger binaries, create containers for the defined participants, set up the certificats and start the network
- Run `docker container ls` to see the outcome

### Install the chaincode
**WARNING** As of now, a bug in hurley prevents installing chaincode in self-defined networks. I created a pull request with the fix, but for now we have to use the default network to demo chaincode.
- Remove the directory `~/hyperledger-fabric-network` and clean the docker environment
- Run `hurl new` without any mor params to get the default network with 2 orgs and 1 peer each

- Upload the `chaincode` dir from this repo into `~/hyperledger-fabric-network`
- cd into `~/hyperledger-fabric-network` 
- To install the chaincode on the peers of both orgs, run `hurl install car-part-tracking node -P ./chaincode -c '{"Args":["Init"]}'`

### Run the chaincode
- Register a car part in the system, run `hurl invoke car-part-tracking produceItem "item-12-345" "supplier-78-90" "exhaust gas cleaning"`
- Check that the car part exists, run `hurl invoke car-part-tracking findItem "item-12-345"`
- Hand over the car part to a different owner, run `hurl invoke car-part-tracking transferItem "item-12-345" "supplier-78-90" "plant-76-54"`
- Produce a new part by consuming the previous part, run `hurl invoke car-part-tracking produceItem "item-88-666" "supplier-78-90" "diesel engine" "item-12-345"`
- Check that the previous part stopped to exist, run `hurl invoke car-part-tracking findItem "item-12-345"` again