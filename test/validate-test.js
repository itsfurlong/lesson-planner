const V=require('../js/validate.js');
const D=__dirname+'/../';
const std=require(D+'data/standards.json'), cites=require(D+'data/citations.json');
const banks=new Function('window',require('fs').readFileSync(D+'js/banks.js','utf8')+';return window.LP_BANKS')({});
const g=std.filter(s=>s.grade_band==='9-10')[0].code, g6=std.filter(s=>s.grade_band==='6')[0].code;
const ph=()=>({minutes:'10'});
const base=()=>({basics:{teacher:'T',grade:'10',subject:'English',period:'50'},standards:[g],
 objectives:[{level:'Analyze',verb:'analyze',knowledge:'conceptual',what:'x',purpose:''}],
 initiation:ph(),instruction:ph(),guided:ph(),independent:ph(),closure:ph(),
 assessment:{graded:'No',rubric:''},struggling:[{initials:'S1',evidence:'ELL',strategy:'s'}],enrichment:[{initials:'S2',evidence:'e',strategy:'s'}],
 research:{checked:{[cites[0].name]:true,[cites[1].name]:true}}});
const model=()=>({header:{teacher:'T',grade:'10',subject:'English',centralFocus:'f'},sections:{A:g+': t',B:'b',C:'c',D:'SWBAT: Students will be able to analyze x.',E:'e',F:'f',H:'h',J:'j (Vygotsky, 1978)'},
 phases:['Initiation','Lang','Guided','Indep','Closure','Homework'].map(t=>({title:t,text:'x'})),struggling:[{initials:'S1',evidence:'e',strategy:'s'}],enrichment:[{initials:'S2',evidence:'e',strategy:'s'}],references:[]});
function t(name,mut,exp){const a=base(),m=model();mut(a,m);const r=V.run({answers:a,model:m,standards:std,cites,banks});
 const ids=r.rules.filter(x=>x.failures.length).map(x=>x.id);console.log((JSON.stringify(ids)===JSON.stringify(exp)?'PASS':'FAIL'),name,JSON.stringify(ids),'want',JSON.stringify(exp));}
t('clean',()=>{},[]);
t('timeline',a=>{a.closure.minutes='';},[1]);
t('verb not measurable',a=>{a.objectives[0].verb='understand';},[2]);
t('verb wrong level',a=>{a.objectives[0].verb='define';},[2]);
t('no level',a=>{a.objectives[0].level='';},[3]);
t('no standards',a=>{a.standards=[];},[4,11].slice(0,1));
t('wrong grade std',a=>{a.standards=[g6];},[4,11]);
t('fake code in A',(a,m)=>{m.sections.A+='\n\nRL.9-10.99: x';},[11]);
t('picked code removed',(a,m)=>{m.sections.A='gone';},[11]);
t('struggle missing strategy',a=>{a.struggling[0].strategy='';},[5]);
t('empty B',(a,m)=>{m.sections.B='';},[6]);
t('empty phase',(a,m)=>{m.phases[2].text=' ';},[6]);
t('no diff & no box',(a,m)=>{a.enrichment=[{initials:'',evidence:'',strategy:''}];m.enrichment=[];},[6]);
t('one citation',a=>{a.research.checked={[cites[0].name]:true};},[7]);
t('fake citation in J',(a,m)=>{m.sections.J='j (Smith, 1999)';},[7]);
t('em dash edit',(a,m)=>{m.sections.B='a—b';},[8]);
t('rubric',a=>{a.assessment.graded='Yes';},[9]);
t('slot',(a,m)=>{m.sections.E='{x}';},[10]);
t('D edited to understand',(a,m)=>{m.sections.D='SWBAT: Students will be able to understand x.';},[2]);

// Several levels, verbs and kinds; older drafts saved single strings.
t('string draft still clean',()=>{},[]);
t('two levels, two verbs, two kinds',a=>{a.objectives[0]={level:['Analyze','Create'],verb:['analyze','write'],knowledge:['conceptual','procedural'],what:'x',purpose:''};},[]);
t('verbs from different picked levels ok',a=>{a.objectives[0]={level:['Analyze','Create'],verb:['examine','design'],knowledge:['conceptual'],what:'x',purpose:''};},[]);
t('not measurable verb in a list',a=>{a.objectives[0]={level:['Analyze','Create'],verb:['analyze','understand'],knowledge:['conceptual'],what:'x',purpose:''};},[2]);
t('verb outside every picked level',a=>{a.objectives[0]={level:['Analyze','Create'],verb:['analyze','define'],knowledge:['conceptual'],what:'x',purpose:''};},[2]);
t('empty lists',a=>{a.objectives[0]={level:[],verb:[],knowledge:[],what:'x',purpose:''};},[2,3]);
t('no kinds, level and verb present',a=>{a.objectives[0]={level:['Analyze'],verb:['analyze'],knowledge:[],what:'x',purpose:''};},[3]);
t('second objective empty lists is skipped',a=>{a.objectives.push({level:[],verb:[],knowledge:[],what:'',purpose:''});},[]);
