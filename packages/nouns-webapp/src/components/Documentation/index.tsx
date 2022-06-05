import Section from '../../layout/Section';
import { Col } from 'react-bootstrap';
import classes from './Documentation.module.css';
import Accordion from 'react-bootstrap/Accordion';
import Link from '../Link';
import { Trans } from '@lingui/macro';

const Documentation = () => {
  const cryptopunksLink = (
    <Link
      text={<Trans>Cryptopunks</Trans>}
      url="https://www.larvalabs.com/cryptopunks"
      leavesPage={true}
    />
  );
  const playgroundLink = (
    <Link text={<Trans>Playground</Trans>} url="/playground" leavesPage={false} />
  );
  const publicDomainLink = (
    <Link
      text={<Trans>public domain</Trans>}
      url="https://creativecommons.org/publicdomain/zero/1.0/"
      leavesPage={true}
    />
  );
  const compoundGovLink = (
    <Link
      text={<Trans>Compound Governance</Trans>}
      url="https://compound.finance/governance"
      leavesPage={true}
    />
  );
  return (
    <Section fullWidth={false}>
      <Col lg={{ span: 10, offset: 1 }}>
        <div className={classes.headerWrapper}>
          <h1>
            <Trans>WTF?</Trans>
          </h1>
          <p className={classes.aboutText}>
            <Trans>
              0xNouns are an experimental attempt to improve the formation of on-chain avatar
              communities. While projects such as {cryptopunksLink} have attempted to bootstrap
              digital community and identity, Nouns attempt to bootstrap identity, community,
              governance, and a treasury that can be used by the community.
            </Trans>
          </p>
          <p className={classes.aboutText} style={{ paddingBottom: '4rem' }}>
            <Trans>
              Learn more below, or start creating 0xNouns off-chain using the {playgroundLink}.
            </Trans>
          </p>
        </div>
        <Accordion flush>
          <Accordion.Item eventKey="0" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Summary</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <ul>
                <li>
                  <Trans>0xNouns artwork is in the {publicDomainLink}.</Trans>
                </li>
                <li>
                  <Trans>One 0xNoun is trustlessly auctioned every 24 hours, forever.</Trans>
                </li>
                <li>
                  <Trans>100% of 0xNoun auction proceeds are trustlessly sent to the treasury.</Trans>
                </li>
                <li>
                  <Trans>Settlement of one auction kicks off the next.</Trans>
                </li>
                <li>
                  <Trans>All 0xNouns are members of 0xNouns subDAO.</Trans>
                </li>
                <li>
                  <Trans>0xNouns subDAO uses a fork of {compoundGovLink}.</Trans>
                </li>
                <li>
                  <Trans>One 0xNoun is equal to one vote.</Trans>
                </li>
                <li>
                  <Trans>The treasury is controlled exclusively by 0xNouns via governance.</Trans>
                </li>
                <li>
                  <Trans>Artwork is generative and stored directly on-chain (not IPFS).</Trans>
                </li>
                <li>
                  <Trans>
                    No explicit rules exist for attribute scarcity; all Nouns are equally rare.
                  </Trans>
                </li>
                <li>
                  <Trans>
                    0xNounders receive rewards in the form of 0xNouns (10% of supply for first 5 years).
                  </Trans>
                </li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Daily Auctions</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p className={classes.aboutText}>
                <Trans>
                  The 0xNouns Auction Contract will act as a self-sufficient 0xNoun generation and
                  distribution mechanism, auctioning one Noun every 24 hours, forever. 100% of
                  auction proceeds (ETH) are automatically deposited in the 0xNouns subDAO treasury,
                  where they are governed by 0xNoun owners.
                </Trans>
              </p>

              <p className={classes.aboutText}>
                <Trans>
                  Each time an auction is settled, the settlement transaction will also cause a new
                  Noun to be minted and a new 24 hour auction to begin.{' '}
                </Trans>
              </p>
              <p>
                <Trans>
                  While settlement is most heavily incentivized for the winning bidder, it can be
                  triggered by anyone, allowing the system to trustlessly auction 0xNouns as long as
                  Ethereum is operational and there are interested bidders.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>0xNouns subDAO</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <Trans>
                0xNouns subDAO utilizes a fork of {compoundGovLink} and is the main governing body of the
                Nouns ecosystem. The 0xNouns subDAO treasury receives 100% of ETH proceeds from daily
                0xNoun auctions. Each 0xNoun is an irrevocable member of 0xNouns DAO and entitled to one
                vote in all governance matters. 0xNoun votes are non-transferable (if you sell your
                0xNoun the vote goes with it) but delegatable, which means you can assign your vote to
                someone else as long as you own your Noun.
              </Trans>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Governance ‘Slow Start’</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  In addition to the precautions taken by Compound Governance, 0xNounders have given
                  themselves a special veto right to ensure that no malicious proposals can be
                  passed while the 0xNoun supply is low. This veto right will only be used if an
                  obviously harmful governance proposal has been passed, and is intended as a last
                  resort.
                </Trans>
              </p>
              <p>
                <Trans>
                  0xNounders will proveably revoke this veto right when they deem it safe to do so.
                  This decision will be based on a healthy Noun distribution and a community that is
                  engaged in the governance process.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>0xNoun Traits</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  0xNouns are generated randomly based Ethereum block hashes. There are no 'if'
                  statements or other rules governing 0xNoun trait scarcity, which makes all Nouns
                  equally rare. As of this writing, 0xNouns are made up of:
                </Trans>
              </p>
              <ul>
                <li>
                  <Trans>backgrounds (1) </Trans>
                </li>
                <li>
                  <Trans>bodies (29)</Trans>
                </li>
                <li>
                  <Trans>accessories (137) </Trans>
                </li>
                <li>
                  <Trans>heads (226) </Trans>
                </li>
                <li>
                  <Trans>glasses (21)</Trans>
                </li>
              </ul>
              <Trans>
                You can experiment with off-chain 0xNoun generation at the {playgroundLink}.
              </Trans>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>On-Chain Artwork</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  0xNouns are stored directly on Ethereum and do not utilize pointers to other
                  networks such as IPFS. This is possible because Noun parts are compressed and
                  stored on-chain using a custom run-length encoding (RLE), which is a form of
                  lossless compression.
                </Trans>
              </p>

              <p>
                <Trans>
                  The compressed parts are efficiently converted into a single base64 encoded SVG
                  image on-chain. To accomplish this, each part is decoded into an intermediate
                  format before being converted into a series of SVG rects using batched, on-chain
                  string concatenation. Once the entire SVG has been generated, it is base64
                  encoded.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="6" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>Noun Seeder Contract</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  The Noun Seeder contract is used to determine 0xNoun traits during the minting
                  process. The seeder contract can be replaced to allow for future trait generation
                  algorithm upgrades. Additionally, it can be locked by the Nouns DAO to prevent any
                  future updates. Currently, Noun traits are determined using pseudo-random number
                  generation:
                </Trans>
              </p>
              <code>keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))</code>
              <br />
              <br />
              <p>
                <Trans>
                  Trait generation is not truly random. Traits can be predicted when minting a Noun
                  on the pending block.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="7" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              <Trans>0xNounder's Reward</Trans>
            </Accordion.Header>
            <Accordion.Body>
              <p>
                <Trans>
                  '0xNounders' are the group of ten builders that initiated Nouns. Here are the
                  0xNounders:
                </Trans>
              </p>
              <ul>
                <li>
                  <Link
                    text="@aubtoshi_nft"
                    url="https://twitter.com/aubtoshi_nft"
                    leavesPage={true}
                  />
                </li>
                <li>
                  <Link
                    text="@cheffo_nft"
                    url="https://twitter.com/cheffo_nft"
                    leavesPage={true}
                  />
                </li>
                <li>
                  <Link text="@ArtIsMyWeapon" url="https://twitter.com/artismyweapon_" leavesPage={true} />
                </li>
                <li>
                  <Link text="@Nonodynamo" url="https://twitter.com/nonodynamo" leavesPage={true} />
                </li>
              </ul>
              <p>
                <Trans>
                  Because 100% of 0xNoun auction proceeds are sent to 0xNouns DAO, 0xNounders have chosen
                  to compensate themselves with 0xNouns. Every 10th 0xNoun for the first 5 years of the
                  project (0xNoun ids #0, #10, #20, #30 and so on) will be automatically sent to the
                  0xNounder's multisig to be vested and shared among the founding members of the
                  project.
                </Trans>
              </p>
              <p>
                <Trans>
                  0xNounder distributions don't interfere with the cadence of 24 hour auctions. 0xNouns
                  are sent directly to the 0xNounder's Multisig, and auctions continue on schedule
                  with the next available 0xNoun ID.
                </Trans>
              </p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
    </Section>
  );
};
export default Documentation;
