import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import hardhat from 'hardhat';
import {
  deployNounsToken,
  getSigners,
  TestSigners,
  setTotalSupply,
  populateDescriptor,
  deployGovernorV1,
  blockNumber,
  advanceBlocks,
  deployGovernorV2,
} from '../../../utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  NounsToken,
  NounsDescriptor__factory as NounsDescriptorFactory,
  NounsDaoLogicV2,
} from '../../../../typechain';
import { parseUnits } from 'ethers/lib/utils';
import { DynamicQuorumParams } from '../../../types';

chai.use(solidity);
const { expect } = chai;
const { ethers } = hardhat;

let token: NounsToken;
let deployer: SignerWithAddress;
let account0: SignerWithAddress;
let signers: TestSigners;
let gov: NounsDaoLogicV2;
let snapshotId: number;

const V1_QUORUM_BPS = 201;

async function setupWithV2() {
  token = await deployNounsToken(signers.deployer);

  await populateDescriptor(
    NounsDescriptorFactory.connect(await token.descriptor(), signers.deployer),
  );

  await setTotalSupply(token, 100);

  const { address: govProxyAddress } = await deployGovernorV1(
    deployer,
    token.address,
    V1_QUORUM_BPS,
  );
  gov = await deployGovernorV2(deployer, govProxyAddress);
}

describe('NounsDAOV2#_setDynamicQuorumParams', () => {
  before(async () => {
    signers = await getSigners();
    deployer = signers.deployer;
    account0 = signers.account0;

    await setupWithV2();
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  describe('allowed values', () => {
    it('returns default values if no config set yet', async () => {
      const params = await gov.getDynamicQuorumParamsAt(await blockNumber());

      expectEqualParams(params, {
        minQuorumVotesBPS: V1_QUORUM_BPS,
        maxQuorumVotesBPS: V1_QUORUM_BPS,
        quorumVotesBPSOffset: 0,
        quorumLinearCoefficient: 0,
        quorumQuadraticCoefficient: 0,
      });
    });

    it('reverts when sender is not admin [ @skip-on-coverage ]', async () => {
      await expect(
        gov.connect(account0)._setDynamicQuorumParams({
          minQuorumVotesBPS: 0,
          maxQuorumVotesBPS: 0,
          quorumVotesBPSOffset: 0,
          quorumLinearCoefficient: 0,
          quorumQuadraticCoefficient: 0,
        }),
      ).to.be.revertedWith('AdminOnly()');
    });

    it('reverts given minQuorum input below lower bound [ @skip-on-coverage ]', async () => {
      await expect(
        gov._setDynamicQuorumParams({
          minQuorumVotesBPS: 199,
          maxQuorumVotesBPS: 0,
          quorumVotesBPSOffset: 0,
          quorumLinearCoefficient: 0,
          quorumQuadraticCoefficient: 0,
        }),
      ).to.be.revertedWith('InvalidMinQuorumVotesBPS()');
    });

    it('reverts given minQuorum input above upper bound [ @skip-on-coverage ]', async () => {
      await expect(
        gov._setDynamicQuorumParams({
          minQuorumVotesBPS: 2001,
          maxQuorumVotesBPS: 0,
          quorumVotesBPSOffset: 0,
          quorumLinearCoefficient: 0,
          quorumQuadraticCoefficient: 0,
        }),
      ).to.be.revertedWith('InvalidMinQuorumVotesBPS()');
    });

    it('reverts given minQuorum input above maxQuorum BPs [ @skip-on-coverage ]', async () => {
      await expect(
        gov._setDynamicQuorumParams({
          minQuorumVotesBPS: 202,
          maxQuorumVotesBPS: 201,
          quorumVotesBPSOffset: 0,
          quorumLinearCoefficient: 0,
          quorumQuadraticCoefficient: 0,
        }),
      ).to.be.revertedWith('MinQuorumBPSGreaterThanMaxQuorumBPS()');
    });

    it('reverts when maxQuorum input above upper bound [ @skip-on-coverage ]', async () => {
      await expect(
        gov._setDynamicQuorumParams({
          minQuorumVotesBPS: 200,
          maxQuorumVotesBPS: 4001,
          quorumVotesBPSOffset: 0,
          quorumLinearCoefficient: 0,
          quorumQuadraticCoefficient: 0,
        }),
      ).to.be.revertedWith('InvalidMaxQuorumVotesBPS()');
    });
  });

  it('given existing prior config, sets value and emits event', async () => {
    await gov._setDynamicQuorumParams({
      minQuorumVotesBPS: 200,
      maxQuorumVotesBPS: 2000,
      quorumVotesBPSOffset: 300,
      quorumLinearCoefficient: parseUnits('1', 6),
      quorumQuadraticCoefficient: parseUnits('2', 6),
    });

    const quorumLinearCoefficient = parseUnits('11', 6);
    const quorumQuadraticCoefficient = parseUnits('22', 6);

    const tx = await gov._setDynamicQuorumParams({
      minQuorumVotesBPS: 222,
      maxQuorumVotesBPS: 2222,
      quorumVotesBPSOffset: 333,
      quorumLinearCoefficient,
      quorumQuadraticCoefficient,
    });

    const actualParams = await gov.getDynamicQuorumParamsAt(await blockNumber());
    expect(actualParams.minQuorumVotesBPS).to.equal(222);
    expect(actualParams.maxQuorumVotesBPS).to.equal(2222);
    expect(actualParams.quorumVotesBPSOffset).to.equal(333);
    expect(actualParams.quorumLinearCoefficient).to.equal(quorumLinearCoefficient);
    expect(actualParams.quorumQuadraticCoefficient).to.equal(quorumQuadraticCoefficient);

    await expect(tx).to.emit(gov, 'MinQuorumVotesBPSSet').withArgs(200, 222);
    await expect(tx).to.emit(gov, 'MaxQuorumVotesBPSSet').withArgs(2000, 2222);
    await expect(tx).to.emit(gov, 'QuorumVotesBPSOffsetSet').withArgs(300, 333);
    await expect(tx)
      .to.emit(gov, 'QuorumLinearCoefficientSet')
      .withArgs(parseUnits('1', 6), quorumLinearCoefficient);
    await expect(tx)
      .to.emit(gov, 'QuorumQuadraticCoefficientSet')
      .withArgs(parseUnits('2', 6), quorumQuadraticCoefficient);
  });

  it('given no prior config, sets value and emits event', async () => {
    const quorumLinearCoefficient = parseUnits('1', 6);
    const quorumQuadraticCoefficient = parseUnits('0.001', 6);
    const tx = await gov._setDynamicQuorumParams({
      minQuorumVotesBPS: 200,
      maxQuorumVotesBPS: 4000,
      quorumVotesBPSOffset: 123,
      quorumLinearCoefficient,
      quorumQuadraticCoefficient,
    });

    const actualParams = await gov.getDynamicQuorumParamsAt(await blockNumber());
    expect(actualParams.minQuorumVotesBPS).to.equal(200);
    expect(actualParams.maxQuorumVotesBPS).to.equal(4000);
    expect(actualParams.quorumVotesBPSOffset).to.equal(123);
    expect(actualParams.quorumLinearCoefficient).to.equal(quorumLinearCoefficient);
    expect(actualParams.quorumQuadraticCoefficient).to.equal(quorumQuadraticCoefficient);

    await expect(tx).to.emit(gov, 'MinQuorumVotesBPSSet').withArgs(V1_QUORUM_BPS, 200);
    await expect(tx).to.emit(gov, 'MaxQuorumVotesBPSSet').withArgs(V1_QUORUM_BPS, 4000);
    await expect(tx).to.emit(gov, 'QuorumVotesBPSOffsetSet').withArgs(0, 123);
    await expect(tx)
      .to.emit(gov, 'QuorumLinearCoefficientSet')
      .withArgs(0, quorumLinearCoefficient);
    await expect(tx)
      .to.emit(gov, 'QuorumQuadraticCoefficientSet')
      .withArgs(0, quorumQuadraticCoefficient);
  });

  describe('quorum params checkpointing', () => {
    let blockNum1: number;
    let blockNum2: number;
    let blockNum3: number;

    const params1: DynamicQuorumParams = {
      minQuorumVotesBPS: 201,
      maxQuorumVotesBPS: 3001,
      quorumVotesBPSOffset: 301,
      quorumLinearCoefficient: 1,
      quorumQuadraticCoefficient: 1,
    };
    const params2: DynamicQuorumParams = {
      minQuorumVotesBPS: 202,
      maxQuorumVotesBPS: 3002,
      quorumVotesBPSOffset: 302,
      quorumLinearCoefficient: 2,
      quorumQuadraticCoefficient: 2,
    };
    const params3: DynamicQuorumParams = {
      minQuorumVotesBPS: 203,
      maxQuorumVotesBPS: 3003,
      quorumVotesBPSOffset: 303,
      quorumLinearCoefficient: 3,
      quorumQuadraticCoefficient: 3,
    };

    before(async () => {
      await advanceBlocks(10);
      await gov._setDynamicQuorumParams(params1);
      blockNum1 = await blockNumber();

      await advanceBlocks(10);
      await gov._setDynamicQuorumParams(params2);
      blockNum2 = await blockNumber();

      await advanceBlocks(10);
      await gov._setDynamicQuorumParams(params3);
      blockNum3 = await blockNumber();
    });

    it('reads correct values for exact block number', async () => {
      expectEqualParams(await gov.getDynamicQuorumParamsAt(blockNum1), params1);
      expectEqualParams(await gov.getDynamicQuorumParamsAt(blockNum2), params2);
      expectEqualParams(await gov.getDynamicQuorumParamsAt(blockNum3), params3);
    });

    it('returns default values if block number too low', async () => {
      const params = await gov.getDynamicQuorumParamsAt(blockNum1 - 2);

      expectEqualParams(params, {
        minQuorumVotesBPS: V1_QUORUM_BPS,
        maxQuorumVotesBPS: V1_QUORUM_BPS,
        quorumVotesBPSOffset: 0,
        quorumLinearCoefficient: 0,
        quorumQuadraticCoefficient: 0,
      });
    });

    it('reads correct values in between block numbers', async () => {
      expectEqualParams(await gov.getDynamicQuorumParamsAt(blockNum1 + 5), params1);
      expectEqualParams(await gov.getDynamicQuorumParamsAt(blockNum2 + 5), params2);
    });

    it('reads latest values if block number higher than latest checkpoint', async () => {
      expectEqualParams(await gov.getDynamicQuorumParamsAt(blockNum3 + 300), params3);
    });
  });

  describe('individual setters', () => {
    const baseParams: DynamicQuorumParams = {
      minQuorumVotesBPS: 200,
      maxQuorumVotesBPS: 3000,
      quorumVotesBPSOffset: 300,
      quorumLinearCoefficient: 1,
      quorumQuadraticCoefficient: 2,
    };

    beforeEach(async () => {
      await gov._setDynamicQuorumParams(baseParams);
    });

    describe('_setMinQuorumVotesBPS', () => {
      it('works and emits', async () => {
        const tx = await gov._setMinQuorumVotesBPS(222);
        const params = await gov.getDynamicQuorumParamsAt(await blockNumber());

        expect(params.minQuorumVotesBPS).to.equal(222);
        await expect(tx).to.emit(gov, 'MinQuorumVotesBPSSet').withArgs(200, 222);
      });

      it('reverts when sender is not admin', async () => {
        await expect(gov.connect(account0)._setMinQuorumVotesBPS(222)).to.be.revertedWith(
          'NounsDAO::_setMinQuorumVotesBPS: admin only',
        );
      });

      it('reverts given input below lower bound', async () => {
        await expect(gov._setMinQuorumVotesBPS(199)).to.be.revertedWith(
          'NounsDAO::_setMinQuorumVotesBPS: invalid min quorum votes bps',
        );
      });

      it('reverts given input above upper bound', async () => {
        await expect(gov._setMinQuorumVotesBPS(2001)).to.be.revertedWith(
          'NounsDAO::_setMinQuorumVotesBPS: invalid min quorum votes bps',
        );
      });

      it('reverts given input above max value', async () => {
        await gov._setMaxQuorumVotesBPS(1998);

        await expect(gov._setMinQuorumVotesBPS(1999)).to.be.revertedWith(
          'NounsDAO::_setMinQuorumVotesBPS: min quorum votes bps greater than max',
        );
      });
    });

    describe('_setMaxQuorumVotesBPS', () => {
      it('works and emits', async () => {
        const tx = await gov._setMaxQuorumVotesBPS(3333);
        const params = await gov.getDynamicQuorumParamsAt(await blockNumber());

        expect(params.maxQuorumVotesBPS).to.equal(3333);
        await expect(tx).to.emit(gov, 'MaxQuorumVotesBPSSet').withArgs(3000, 3333);
      });

      it('reverts when sender is not admin', async () => {
        await expect(gov.connect(account0)._setMaxQuorumVotesBPS(3333)).to.be.revertedWith(
          'NounsDAO::_setMaxQuorumVotesBPS: admin only',
        );
      });

      it('reverts given input above upper bound', async () => {
        await expect(gov._setMaxQuorumVotesBPS(4001)).to.be.revertedWith(
          'NounsDAO::_setMaxQuorumVotesBPS: invalid max quorum votes bps',
        );
      });

      it('reverts given input less than min param', async () => {
        await expect(gov._setMaxQuorumVotesBPS(199)).to.be.revertedWith(
          'NounsDAO::_setMaxQuorumVotesBPS: min quorum votes bps greater than max',
        );
      });
    });

    describe('_setQuorumVotesBPSOffset', () => {
      it('works and emits', async () => {
        const tx = await gov._setQuorumVotesBPSOffset(321);
        const params = await gov.getDynamicQuorumParamsAt(await blockNumber());

        expect(params.quorumVotesBPSOffset).to.equal(321);
        await expect(tx).to.emit(gov, 'QuorumVotesBPSOffsetSet').withArgs(300, 321);
      });

      it('reverts when sender is not admin', async () => {
        await expect(gov.connect(account0)._setQuorumVotesBPSOffset(321)).to.be.revertedWith(
          'NounsDAO::_setQuorumVotesBPSOffset: admin only',
        );
      });
    });

    describe('_setQuorumLinearCoefficient', () => {
      it('works and emits', async () => {
        const tx = await gov._setQuorumLinearCoefficient(111);
        const params = await gov.getDynamicQuorumParamsAt(await blockNumber());

        expect(params.quorumLinearCoefficient).to.equal(111);
        await expect(tx).to.emit(gov, 'QuorumLinearCoefficientSet').withArgs(1, 111);
      });

      it('reverts when sender is not admin', async () => {
        await expect(gov.connect(account0)._setQuorumLinearCoefficient(111)).to.be.revertedWith(
          'NounsDAO::_setQuorumLinearCoefficient: admin only',
        );
      });
    });

    describe('_setQuorumQuadraticCoefficient', () => {
      it('works and emits', async () => {
        const tx = await gov._setQuorumQuadraticCoefficient(222);
        const params = await gov.getDynamicQuorumParamsAt(await blockNumber());

        expect(params.quorumQuadraticCoefficient).to.equal(222);
        await expect(tx).to.emit(gov, 'QuorumQuadraticCoefficientSet').withArgs(2, 222);
      });

      it('reverts when sender is not admin', async () => {
        await expect(gov.connect(account0)._setQuorumQuadraticCoefficient(222)).to.be.revertedWith(
          'NounsDAO::_setQuorumQuadraticCoefficient: admin only',
        );
      });
    });
  });

  function expectEqualParams(p1: DynamicQuorumParams, p2: DynamicQuorumParams) {
    expect(p1.maxQuorumVotesBPS).to.equal(p2.maxQuorumVotesBPS);
    expect(p1.minQuorumVotesBPS).to.equal(p2.minQuorumVotesBPS);
    expect(p1.quorumVotesBPSOffset).to.equal(p2.quorumVotesBPSOffset);
    expect(p1.quorumLinearCoefficient).to.equal(p2.quorumLinearCoefficient);
    expect(p1.quorumQuadraticCoefficient).to.equal(p2.quorumQuadraticCoefficient);
  }
});
