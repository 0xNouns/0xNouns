import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { NounSeed, NounData } from './types';
import { images, bgcolors } from './image-data.json';

const { bodies, accessories, heads, glasses } = images;

/**
 * Get encoded part and background information using a Noun seed
 * @param seed The Noun seed
 */
export const getNounData = (seed: NounSeed): NounData => {
  return {
    parts: [
      bodies[seed.body],
      accessories[seed.accessory],
      heads[seed.head],
      glasses[seed.glasses],
    ],
    background: bgcolors[seed.background],
  };
};

/**
 * Generate a random Noun seed
 * @param seed The Noun seed
 */
export const getRandomNounSeed = (): NounSeed => {
  return {
    background: Math.floor(Math.random() * bgcolors.length),
    body: Math.floor(Math.random() * bodies.length),
    accessory: Math.floor(Math.random() * accessories.length),
    head: Math.floor(Math.random() * heads.length),
    glasses: Math.floor(Math.random() * glasses.length),
  };
};

/**
 * Emulate bitwise right shift and uint cast
 * @param hex Hex representation of a number
 * @param shiftAmount The amount to right shift
 * @param uintSize The uint bit size to cast to
 */
export const hexShiftAndCast = (hex: string, shiftAmount: number, uintSize: number): string => {
  hex = hex.replace(/0x/, '');
  const start = hex.length - (shiftAmount + uintSize) / 4;
  const end = hex.length - shiftAmount / 4;
  return `0x${hex.substring(start, end)}`;
};

/**
 * Emulates the NounsSeeder.sol methodology for pseudorandomly selecting a part
 * @param pseudorandomness Hex representation of a number
 * @param partCount The number of parts to pseudorandomly choose from
 * @param shiftAmount The amount to right shift
 * @param uintSize The size of the unsigned integer
 */
export const getPseudorandomPart = (
  pseudorandomness: string,
  partCount: number,
  shiftAmount: number,
  uintSize = 48,
): number => {
  const uint48 = hexShiftAndCast(pseudorandomness, shiftAmount, uintSize);
  return BigNumber.from(uint48).mod(partCount).toNumber();
};

/**
 * Emulates the NounsSeeder.sol methodology for generating a Noun seed
 * @param nounId The Noun tokenId used to create pseudorandomness
 * @param blockHash The block hash use to create pseudorandomness
 */
export const getNounSeedFromBlockHash = (nounId: BigNumberish, blockHash: string): NounSeed => {
  const pseudorandomness = solidityKeccak256(['bytes32', 'uint256'], [blockHash, nounId]);
  return {
    background: getPseudorandomPart(pseudorandomness, bgcolors.length, 0),
    body: getPseudorandomPart(pseudorandomness, bodies.length, 48),
    accessory: getPseudorandomPart(pseudorandomness, accessories.length, 96),
    head: getPseudorandomPart(pseudorandomness, heads.length, 144),
    glasses: getPseudorandomPart(pseudorandomness, glasses.length, 192),
  };
};
