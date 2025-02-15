import type * as RDF from '@rdfjs/types';
import type { Partial } from '@treecg/bucketizer-core';
import { BucketizerCore } from '@treecg/bucketizer-core';
import type { BucketizerCoreOptions, RelationParameters } from '@treecg/types';
import { RelationType } from '@treecg/types';

export type BasicInputType = Partial<BucketizerCoreOptions>;
export class BasicBucketizer extends BucketizerCore<{}> {
  public pageNumber: number;
  public memberCounter: number;

  private constructor(bucketizerOptions: BasicInputType, state?: any) {
    super(bucketizerOptions);

    this.pageNumber = 0;
    this.memberCounter = 0;

    if (state) {
      this.importState(state);
    }
  }

  public static build(options: BasicInputType, state?: any): BasicBucketizer {
    return new BasicBucketizer(options, state);
  }

  public bucketize = (_: RDF.Quad[], memberId: string): RDF.Quad[] => {
    const out: RDF.Quad[] = [];

    if (this.memberCounter >= this.options.pageSize) {
      const currentPage = this.pageNumber;
      this.increasePageNumber();
      this.resetMemberCounter();

      const parameters = this.createRelationParameters(this.pageNumber);
      this.setHypermediaControls(`${currentPage}`, parameters);
      out.push(...this.expandRelation(`${currentPage}`, parameters));
    }

    this.increaseMemberCounter();

    out.push(...this.createSDSRecord(this.factory.namedNode(memberId), [`${this.pageNumber}`]));
    return out;
  };

  public exportState = (): any => {
    const state = super.exportState();
    state.pageNumber = this.pageNumber;
    state.memberCounter = this.memberCounter;

    return state;
  };

  public importState = (state: any): void => {
    super.importState(state);
    this.pageNumber = state.pageNumber;
    this.memberCounter = state.memberCounter;
  };

  private readonly increasePageNumber = (): number => this.pageNumber++;

  private readonly increaseMemberCounter = (): number => this.memberCounter++;

  private readonly resetMemberCounter = (): void => {
    this.memberCounter = 0;
  };

  private readonly createRelationParameters = (
    targetNode: number,
  ): RelationParameters => ({
    nodeId: targetNode.toString(),
    type: RelationType.Relation,
  });
}
