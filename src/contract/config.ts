class Config {

    exchange:any = {
        address:"3BKUyhLjvTZ64Sx6bX5uNwoNX7YVwdVhvHkiwpdoJjpYUtpw7ujsuBKBtMpqNPDxz257Ls3GwEPs2kfvkgPTr48N",

        abi:[
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "name": "coin",
                        "type": "string"
                    }
                ],
                "name": "getFeeRate",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "payCoin",
                        "type": "string"
                    },
                    {
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "name": "sellFromWallet",
                "outputs": [],
                "payable": true,
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "payCoin",
                        "type": "string"
                    }
                ],
                "name": "tokenList",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "exchangeCoin",
                                "type": "string"
                            },
                            {
                                "name": "payCoin",
                                "type": "string"
                            },
                            {
                                "name": "decimals",
                                "type": "uint256"
                            },
                            {
                                "name": "startPrice",
                                "type": "uint256"
                            },
                            {
                                "name": "lastPrice",
                                "type": "uint256"
                            },
                            {
                                "name": "volume",
                                "type": "uint256"
                            },
                            {
                                "name": "offline",
                                "type": "bool"
                            },
                            {
                                "name": "totalMoney",
                                "type": "uint256"
                            }
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    }
                ],
                "name": "pairVolumeOf24H",
                "outputs": [
                    {
                        "name": "firstPrice",
                        "type": "uint256"
                    },
                    {
                        "name": "lastPrice",
                        "type": "uint256"
                    },
                    {
                        "name": "volumeTotal",
                        "type": "uint256"
                    },
                    {
                        "name": "totolMoney",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "tokenStr",
                        "type": "string"
                    },
                    {
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "withdraw",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    },
                    {
                        "name": "ids",
                        "type": "uint256[]"
                    }
                ],
                "name": "orders",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "name": "receiverAddr",
                                "type": "address"
                            },
                            {
                                "name": "opData",
                                "type": "bytes"
                            },
                            {
                                "name": "price",
                                "type": "uint256"
                            },
                            {
                                "name": "value",
                                "type": "uint256"
                            },
                            {
                                "name": "dealValue",
                                "type": "uint256"
                            },
                            {
                                "name": "createTime",
                                "type": "uint256"
                            },
                            {
                                "name": "status",
                                "type": "uint256"
                            },
                            {
                                "name": "orderType",
                                "type": "bool"
                            },
                            {
                                "name": "payCoinValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "coin",
                        "type": "string"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "amount",
                                "type": "uint256"
                            },
                            {
                                "name": "lockedAmount",
                                "type": "uint256"
                            },
                            {
                                "name": "coin",
                                "type": "string"
                            }
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    },
                    {
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "buy",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "receiverAddr",
                        "type": "address"
                    },
                    {
                        "name": "opData",
                        "type": "bytes"
                    }
                ],
                "name": "bigCustomerBuy",
                "outputs": [
                    {
                        "name": "exOrderId",
                        "type": "uint256"
                    }
                ],
                "payable": true,
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    },
                    {
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "sell",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "coin",
                        "type": "string"
                    }
                ],
                "name": "getExBills",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "value",
                                "type": "uint256"
                            },
                            {
                                "name": "timestamp",
                                "type": "uint256"
                            },
                            {
                                "name": "typ",
                                "type": "uint8"
                            }
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    },
                    {
                        "name": "orderIds",
                        "type": "uint256[]"
                    }
                ],
                "name": "cancel",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getPayCoins",
                "outputs": [
                    {
                        "name": "",
                        "type": "string[]"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "name": "value",
                        "type": "uint256"
                    }
                ],
                "name": "buyFromWallet",
                "outputs": [],
                "payable": true,
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    }
                ],
                "name": "pairInfo",
                "outputs": [
                    {
                        "components": [
                            {
                                "components": [
                                    {
                                        "name": "id",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "price",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "value",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "dealValue",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "createTime",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "status",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "orderType",
                                        "type": "bool"
                                    },
                                    {
                                        "name": "payCoinValue",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "buyOrders",
                                "type": "tuple[]"
                            },
                            {
                                "components": [
                                    {
                                        "name": "id",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "price",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "value",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "dealValue",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "createTime",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "status",
                                        "type": "uint256"
                                    },
                                    {
                                        "name": "orderType",
                                        "type": "bool"
                                    },
                                    {
                                        "name": "payCoinValue",
                                        "type": "uint256"
                                    }
                                ],
                                "name": "sellOrders",
                                "type": "tuple[]"
                            }
                        ],
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    },
                    {
                        "name": "offset",
                        "type": "uint256"
                    },
                    {
                        "name": "limit",
                        "type": "uint256"
                    }
                ],
                "name": "pageOrders",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "name": "price",
                                "type": "uint256"
                            },
                            {
                                "name": "value",
                                "type": "uint256"
                            },
                            {
                                "name": "dealValue",
                                "type": "uint256"
                            },
                            {
                                "name": "createTime",
                                "type": "uint256"
                            },
                            {
                                "name": "status",
                                "type": "uint256"
                            },
                            {
                                "name": "orderType",
                                "type": "bool"
                            },
                            {
                                "name": "payCoinValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "myPageOrders",
                        "type": "tuple[]"
                    },
                    {
                        "name": "count",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "coin",
                        "type": "string"
                    },
                    {
                        "name": "offset",
                        "type": "uint256"
                    },
                    {
                        "name": "limit",
                        "type": "uint256"
                    }
                ],
                "name": "getBills",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "value",
                                "type": "uint256"
                            },
                            {
                                "name": "timestamp",
                                "type": "uint256"
                            },
                            {
                                "name": "typ",
                                "type": "uint8"
                            }
                        ],
                        "name": "bills",
                        "type": "tuple[]"
                    },
                    {
                        "name": "count",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "exchangeCoin",
                        "type": "string"
                    },
                    {
                        "name": "payCoin",
                        "type": "string"
                    }
                ],
                "name": "pendingOrders",
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "id",
                                "type": "uint256"
                            },
                            {
                                "name": "price",
                                "type": "uint256"
                            },
                            {
                                "name": "value",
                                "type": "uint256"
                            },
                            {
                                "name": "dealValue",
                                "type": "uint256"
                            },
                            {
                                "name": "createTime",
                                "type": "uint256"
                            },
                            {
                                "name": "status",
                                "type": "uint256"
                            },
                            {
                                "name": "orderType",
                                "type": "bool"
                            },
                            {
                                "name": "payCoinValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }
        ]

    }
}

const config = new Config();

export default config