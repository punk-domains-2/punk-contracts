# Post-Audit Remediation Report

Please refer to the PDF of the audit report in this folder for more details. Below is a summary of the code changes we made based on the audit findings.

## L01 \- Inconsistent msg.sender usage In Metadata Retrieval

In *FlexiPunkMetadata.sol*, the TLD contract address was accessed implicitly via *msg.sender* in the *getMetadata()* function.

The audit recommends passing the TLD contract address explicitly through the *getMetadata()* parameters to avoid incorrect assumptions about the caller.

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/ddc7d85c944c2d0c417ddd9d7329a28613a9ae24](https://github.com/punk-domains-2/punk-contracts/commit/ddc7d85c944c2d0c417ddd9d7329a28613a9ae24) 

## I01 \- Events Not Indexed

The events in the Resolver contract didn’t have any indexed fields, making it inefficient to filter and search for specific events in the transaction logs. Since the blockchain’s event filtering relies on indexed parameters to optimize queries, this limited performance.

We fixed this issue by indexing all the address fields in the events. We chose not to index string parameters, since only their hashes are stored in the logs, not the actual strings.

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/c54e4cfc0888372068124af95677227eb451f021](https://github.com/punk-domains-2/punk-contracts/commit/c54e4cfc0888372068124af95677227eb451f021) 

## I02 \- Floating Pragma

The audit recommended using a fixed Solidity version (0.8.4) in the smart contracts, instead of a so-called floating version (^0.8.4), which allows the code to be compiled with any 0.8.x version from 0.8.4 onward.

Using a fixed compiler version ensures that the contract is always compiled with the intended version, reducing the risk of unexpected behavior due to compiler changes. It also improves reproducibility and consistency across different development and deployment environments.

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/b8ceab260119127b033e405e22041aa1b7c783f1](https://github.com/punk-domains-2/punk-contracts/commit/b8ceab260119127b033e405e22041aa1b7c783f1) 

## I03 \- External Functions Declared as Public

Most of the functions in the Resolver contract were set as *public*, even though they could be set as *external*. The advantage of *external* functions is that they require less gas.

We have fixed this issue by setting the functions (those which can be set to *external*) to *external*.

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/fb542fbd09feb860eba52037c5a0e20c3e9e6516](https://github.com/punk-domains-2/punk-contracts/commit/fb542fbd09feb860eba52037c5a0e20c3e9e6516) 

## I04 \- Poor Design In Name Max Length Modification

We believe that allowing the owner to change the max length in either direction is not an issue.

Even if a long domain name was minted under the old rules, and the new rules only allow shorter names, this doesn’t affect the functionality of the already minted domain, as the auditors themselves also noted.

The *nameMaxLength* variable is intended to serve as an upper limit for minting **new** domains, not for using existing ones.

That said, we recognize that the original comment next to the *nameMaxLength* variable may have been unclear, so we’ve updated it from “max length of a domain name” to “max length for minting a domain name.”

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/61e967b94681c45db746bc46a5f72b9315c54aec](https://github.com/punk-domains-2/punk-contracts/commit/61e967b94681c45db746bc46a5f72b9315c54aec) 

## I05 \- Lack Of Functionality To Set Default Name After Deletion

The I05 finding claims that there is no function where the user can set a default domain name. This looks like an oversight, since the function actually exists: [*editDefaultDomain()*](https://github.com/punk-domains-2/punk-contracts/blob/f26bb7ee78daff8ac8df76184dc1d0482c0a388f/contracts/factories/flexi/FlexiPunkTLD.sol#L107).

Since the necessary function already exists, there was no need to fix anything in this section.

## I06 \- Missing Upper Bound Check For Royalty

This finding recommends setting an upper bound limit for royalties at 5000 bips (or 50%).

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/4f8dd806b1283f59918ae8686803f98f3d006fcb](https://github.com/punk-domains-2/punk-contracts/commit/4f8dd806b1283f59918ae8686803f98f3d006fcb) 

## I07 \- Lack Of Input Validation Allows Storage Bloat And Unicode Abuse

We’re aware that users can use any Unicode character when choosing a domain name. This includes characters that closely resemble others, as well as invisible or blank Unicode characters.

However, due to the large number of such characters (and the fact that the Unicode character set can change over time) we believe input validation should not be handled at the smart contract level, but rather on the frontend.

This topic has also been discussed within the ENS community, which reached the same conclusion.

We’ve implemented the necessary Unicode checks on our website’s frontend.

## I08 \- No Event for Royalty/Referral Changes

Auditors recommended implementing events for a few more functions.

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/1d78580ddb4f9320b147af607eb79adfb87eb5e6](https://github.com/punk-domains-2/punk-contracts/commit/1d78580ddb4f9320b147af607eb79adfb87eb5e6) 

## I09 \- No Pausing Mechanism For Transfers Or Burn Functions

This audit finding recommends considering the implementation of a pause mechanism for domains. However, since domain contracts do not hold any TVL, we believe there’s no need for such a mechanism.

Moreover, including a pause feature goes against our principles of decentralization and censorship resistance. For these reasons, we chose not to implement it.

## I10 \- No Supply Cap

This audit finding recommends considering the implementation of an optional supply cap per TLD to enforce scarcity, if that is an important business or community feature.

In our case, scarcity or a supply cap is not a relevant feature, which is why we don’t enforce a supply cap on our domains.

## I11 \- Gas Optimization: Unbounded Array Operations and Custom Errors

We’ve replaced *require()* statements with custom errors, which is a newer, more gas-efficient way of handling errors and also helps reduce the smart contract size.

As for looping over TLDs, we don’t see this as an issue, since the number of issued TLDs is very small and the issuance is controlled.

Fixed in this commit: [https://github.com/punk-domains-2/punk-contracts/commit/14d18243fd51e0f50865ed04e8237a9396b4ad23](https://github.com/punk-domains-2/punk-contracts/commit/14d18243fd51e0f50865ed04e8237a9396b4ad23) 