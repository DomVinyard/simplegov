
My job is to: 

1. Query for new bills and save them to the database
2. Run a series of Prompts against the raw text and save the outputs to the database

### Query for new bills

Run on a loop, every [n] minutes, query the government api for new bills. Use the `last_updated` field to determine if a bill is new. We also store the web link to the PDF of the bill. Download the PDF, convert it to raw text and save it to the database.

### Run Prompts

Run on a loop, every [n] minutes, query the database for bills which have not been processed with prompts. For each bill:

Run a series of prompts against the text
   - Explain the bill in simple language
   - Generate arguments for and against
   - Generate counter arguments to those arguments
   - Lots of other fun prompts could be considered eventually (section at bottom) but this this is a good starting point

Save all of these to the database.

We should also assign a version number to the set of prompts we are using. Every time we modify the prompts we should increment the version number. This processor step should run on a loop and process any bill which has not been processed or has a version number less than the current version number.

#### Future Prompts

- Is this bill controversial?
- How will different audience segments react to this bill?
- Who proposed this bill and what is their agenda

