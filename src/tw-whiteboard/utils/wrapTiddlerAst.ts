import { IParseTreeNode } from 'tiddlywiki';

export const wrapTiddlerAst = (node: IParseTreeNode | IParseTreeNode[]): IParseTreeNode => ({
  type: 'tiddler',
  children: [{ type: 'element', tag: 'p', children: Array.isArray(node) ? node : [node] }],
});
