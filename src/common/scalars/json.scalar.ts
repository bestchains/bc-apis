/**
 * JSON scalar
 *
 * https://github.com/taion/graphql-type-json/blob/10418fa03875947140d1c0bd8b8de51926252e35/src/index.js
 */
import { CustomScalar, Scalar } from '@nestjs/graphql';
import {
  GraphQLScalarLiteralParser,
  GraphQLScalarSerializer,
  GraphQLScalarValueParser,
} from 'graphql';
import { Kind, print } from 'graphql/language';

function identity(value: any) {
  return value;
}

function ensureObject(value: any) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(
      `JSONObject cannot represent non-object value: ${value}`,
    );
  }

  return value;
}

function parseObject(typeName: string, ast: any, variables: any) {
  const value = Object.create(null);
  ast.fields.forEach((field) => {
    value[field.name.value] = parseLiteral(typeName, ast, variables);
  });
  return value;
}

function parseLiteral(typeName: string, ast: any, variables: any) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(typeName, ast, variables);
    case Kind.LIST:
      return ast.values.map((n) => parseLiteral(typeName, n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
      return variables ? variables[ast.name.value] : undefined;
    default:
      throw new TypeError(`${typeName} cannot represent value: ${print(ast)}`);
  }
}

@Scalar('JSON', () => JSON)
export class JSONScalar implements CustomScalar<any, any> {
  description =
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).';
  specifiedByURL =
    'http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf';
  parseValue: GraphQLScalarValueParser<any> = identity;
  serialize: GraphQLScalarSerializer<any> = identity;
  parseLiteral: GraphQLScalarLiteralParser<any> = (ast, variables) =>
    parseLiteral('JSON', ast, variables);
}

@Scalar('JSONObject', () => Object)
export class JSONObjectScalar implements CustomScalar<any, any> {
  description =
    'The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).';
  specifiedByURL =
    'http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf';
  parseValue: GraphQLScalarValueParser<any> = ensureObject;
  serialize: GraphQLScalarSerializer<any> = ensureObject;
  parseLiteral: GraphQLScalarLiteralParser<any> = (ast, variables) => {
    if (ast.kind !== Kind.OBJECT) {
      throw new TypeError(
        `JSONObject cannot represent non-object value: ${print(ast)}`,
      );
    }
    return parseObject('JSONObject', ast, variables);
  };
}
