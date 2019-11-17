/*
* hurl install <unique-name> node -P <dir> -c '{"Args":["Init"]}'
* hurl upgrade <unique-name> node 1.1 -P cpt -c '{"Args":["Init"]}
* hurl invoke <unique-name> produceItem "12345" "23456" "engine"
* hurl invoke <unique-name> transferItem "12345" "23456" "34567"
* hurl invoke <unique-name> findItem "12345"
*
*/

const shim = require('fabric-shim');

var Chaincode = class {


  // Init can be called via hurley when instantiating the chain code
  // could be used to create some initial objects 
  async Init(stub) {

    //     let args = stub.getFunctionAndParameters().params;

    //     try {
    //       await stub.putState("foo", Buffer.from("bar"));
    //     } catch (err) {
    //       return shim.error(err);
    //     }

    return shim.success();
  }

  // Invoke is called by hurley whenever the user invokes a method. 
  // Invoke has to check which method to invoke and pass the input params
  async Invoke(stub) {
    let input = stub.getFunctionAndParameters();

    let functionToInvoke = this[input.fcn];
    if (!functionToInvoke) {
      console.log(input.fcn + ' not found.');
      return shim.error(new Error(input.fcn + ' not found.'));
    }

    try {
      let result = await functionToInvoke(stub, input.params);
      return shim.success(result);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async produceItem(stub, args) {
    if (args.length < 3)
      throw new Error("Invoke 'procudeItem' with itemId, manufacturerId, itemType, consumedItemIds...");

    // delete items that are built into the new item      
    let i = 3;
    while(args[i]) {
      let consumedItemId = args[i++];
      await stub.deleteState(consumedItemId);
    }

    let itemId = args[0];
    let manufacturerId = args[1];
    let itemType = args[2];

    let item = {
      id: itemId,
      owner: manufacturerId,
      manufacturer: manufacturerId,
      type: itemType
    };

    let itemBuffer = Buffer.from(JSON.stringify(item));
    await stub.putState(itemId, itemBuffer);
    console.log('Produced item added to the ledger successfully.');
    return itemBuffer;
  }

  async transferItem(stub, args) {
    if (args.length != 3)
      throw new Error("Invoke 'transferItem' with itemId, previousOwnerId, newOwnerId");

    let itemId = args[0];
    let previousOwnerId = args[1];
    let newOwnerId = args[2];

    let itemBuffer = await stub.getState(itemId);

    if (!itemBuffer || itemBuffer.toString().length <= 0)
      throw new Error('Item does not exist');

    let item = JSON.parse(itemBuffer);

    if (item.owner != previousOwnerId)
      throw new Error("Item does not belong to " + previousOwnerId);

    item.owner = newOwnerId;
    let updatedItemBuffer = Buffer.from(JSON.stringify(item));
    await stub.putState(itemId, updatedItemBuffer);
    console.log('Transferred item to new owner.');
    return updatedItemBuffer;
  }

  async findItem(stub, args) {
    if (args.length != 1)
      throw new Error("Invoke 'findItem' with itemId");

    let itemId = args[0];
    let itemBuffer = await stub.getState(itemId);

    if (!itemBuffer || itemBuffer.length <= 0)
      throw new Error('Item does not exist');

    let item = JSON.parse(itemBuffer);
    console.log(item);
    return itemBuffer;
  }

};

shim.start(new Chaincode());
