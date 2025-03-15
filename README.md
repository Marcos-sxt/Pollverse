# PollVerse Explorer

PollVerse Explorer is a decentralized polling (voting) dApp built with React, TypeScript, Vite, and Solidity smart contracts. The application allows users to create polls, vote, and view results—all on a blockchain. This project demonstrates an implementation with smart contract development, Web3 integration, and modern front-end development.

![Home Page Screenshot](./screenshots/Screenshot%20from%202025-03-15%2016-02-15.png)

## Features

- **Decentralized Poll Creation**: Users can create polls by specifying a title and multiple voting options.
- **Real-Time Voting**: Vote on active polls and see the updated results in real time.
- **Poll Details**: View detailed information for each poll including total votes, individual option counts, and percentages.
- **User Authentication**: Integrates with MetaMask to ensure that only authenticated users can vote.
- **DAO & Governance Use Cases**: Designed with real-world scenarios in mind, including DAO governance polls and strategic proposals.

## Demo

Check out the live demo on Vercel
## "vercelplaceholder" ##

## Technologies Used

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - Shadcn-UI components
- **Smart Contracts**:
  - Solidity (v0.8.26)
  - Deployed on the Sepolia testnet
- **Blockchain Integration**:
  - Ethers.js (v5)
  - MetaMask
- **Data Fetching & State Management**:
  - React Query (@tanstack/react-query)



## Project Structure

```plaintext
/contracts            # Solidity smart contracts
/scripts              # Deployment scripts for Hardhat
/src                  # React application source code
  /components         # Reusable UI components (PollCard, PollDetail, etc.)
  /hooks              # Custom hooks (e.g., useWeb3)
  /pages              # Application pages (PollList, PollDetail, etc.)
.env                  # Environment variables (not committed)
hardhat.config.js     # Hardhat configuration for contract deployment
package.json          # Project metadata and dependencies
README.md             # Project documentation
```

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open an issue or submit a pull request.

## Contact

- Email: marcossantos7955@gmail.com
- GitHub: Marcos-sxt


## Some Screeshots

![Create New Poll Page](./screenshots/Screenshot%20from%202025-03-15%2015-57-45.png)


![Poll Details Card](./screenshots/Screenshot%20from%202025-03-15%2016-01-01.png)

