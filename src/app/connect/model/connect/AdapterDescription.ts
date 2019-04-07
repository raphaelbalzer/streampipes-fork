import {RdfId} from '../../../platform-services/tsonld/RdfId';
import {RdfProperty} from '../../../platform-services/tsonld/RdfsProperty';
import {RdfsClass} from '../../../platform-services/tsonld/RdfsClass';
import {TransformationRuleDescription} from './rules/TransformationRuleDescription';
import {StaticProperty} from '../StaticProperty';

@RdfsClass('sp:AdapterDescription')
export class AdapterDescription {

  @RdfId
  public id: string;

  @RdfProperty('http://www.w3.org/2000/01/rdf-schema#label')
  public label: string;

  @RdfProperty('http://www.w3.org/2000/01/rdf-schema#description')
  public description: string;

  @RdfProperty('sp:hasAppId')
  public appId: string;

  @RdfProperty('sp:couchDBId')
  public couchDbId: string;

  @RdfProperty('sp:userName')
  public userName: string;

  @RdfProperty('sp:hasUri')
  public uri: string;

  @RdfProperty('sp:iconUrl')
  public iconUrl: string;

  @RdfProperty('sp:icon')
  public icon: string;

  @RdfProperty('sp:adapterType')
  public adapterType: string;

  @RdfProperty('sp:rules')
  public rules: TransformationRuleDescription[];

  @RdfProperty('sp:config')
  public config: StaticProperty[] = [];

  public templateTitle: String;

  public isTemplate: boolean;

  constructor(id: string) {
    this.id = id;
  }

}
