import { StandaloneNounCircular } from '../../components/StandaloneNoun';
import { BigNumber as EthersBN } from 'ethers';
import classes from './NounImageVoteTable.module.css';

interface NounImageVoteTableProps {
  nounIds: string[];
}
const NOUNS_PER_VOTE_CARD = 15;

const NounImageVoteTable: React.FC<NounImageVoteTableProps> = props => {
  const { nounIds } = props;
  const paddedNounIds = nounIds
    .map((nounId: string) => {
      return <StandaloneNounCircular nounId={EthersBN.from(nounId)} />;
    })
    .concat(Array(NOUNS_PER_VOTE_CARD).fill(<div className={classes.grayCircle} />))
    .slice(0, NOUNS_PER_VOTE_CARD);

  const content = () => {
    const rows = 3;
    const rowLength = 5;

    return Array(rows)
      .fill(0)
      .map((_, i) => (
        <tr>
          {Array(rowLength)
            .fill(0)
            .map((_, j) => (
              <td>{paddedNounIds[i * rowLength + j]}</td>
            ))}
        </tr>
      ));
  };

  return <table className={classes.wrapper}>{content()}</table>;
};

export default NounImageVoteTable;
