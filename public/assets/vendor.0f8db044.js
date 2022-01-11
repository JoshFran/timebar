/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,s))}}}function Yi(){const e=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof e=="object"&&e.id!==void 0}function Ji(){return typeof indexedDB=="object"}function Gi(){return new Promise((e,t)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(s),e(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var i;t(((i=r.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){t(n)}})}function Xi(){return!(typeof navigator=="undefined"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zi="FirebaseError";class wt extends Error{constructor(t,n,s){super(n);this.code=t,this.customData=s,this.name=Zi,Object.setPrototypeOf(this,wt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Dt.prototype.create)}}class Dt{constructor(t,n,s){this.service=t,this.serviceName=n,this.errors=s}create(t,...n){const s=n[0]||{},r=`${this.service}/${t}`,i=this.errors[t],o=i?Qi(i,s):"Error",a=`${this.serviceName}: ${o} (${r}).`;return new wt(r,a,s)}}function Qi(e,t){return e.replace(eo,(n,s)=>{const r=t[s];return r!=null?String(r):`<${s}?>`})}const eo=/\{\$([^}]+)}/g;function Nt(e,t){if(e===t)return!0;const n=Object.keys(e),s=Object.keys(t);for(const r of n){if(!s.includes(r))return!1;const i=e[r],o=t[r];if(Ds(i)&&Ds(o)){if(!Nt(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!n.includes(r))return!1;return!0}function Ds(e){return e!==null&&typeof e=="object"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const to=1e3,no=2,so=4*60*60*1e3,ro=.5;function Ns(e,t=to,n=no){const s=t*Math.pow(n,e),r=Math.round(ro*s*(Math.random()-.5)*2);return Math.min(so,s+r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ls(e){return e&&e._delegate?e._delegate:e}class Le{constructor(t,n,s){this.name=t,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const je="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class io{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){const s=new Wi;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){var n;const s=this.normalizeInstanceIdentifier(t==null?void 0:t.identifier),r=(n=t==null?void 0:t.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(ao(t))try{this.getOrInitializeService({instanceIdentifier:je})}catch{}for(const[n,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(t=je){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=je){return this.instances.has(t)}getOptions(t=je){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:n={}}=t,s=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);s===a&&o.resolve(r)}return r}onInit(t,n){var s;const r=this.normalizeInstanceIdentifier(n),i=(s=this.onInitCallbacks.get(r))!==null&&s!==void 0?s:new Set;i.add(t),this.onInitCallbacks.set(r,i);const o=this.instances.get(r);return o&&t(o,r),()=>{i.delete(t)}}invokeOnInitCallbacks(t,n){const s=this.onInitCallbacks.get(n);if(!!s)for(const r of s)try{r(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let s=this.instances.get(t);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:oo(t),options:n}),this.instances.set(t,s),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(s,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,s)}catch{}return s||null}normalizeInstanceIdentifier(t=je){return this.component?this.component.multipleInstances?t:je:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function oo(e){return e===je?void 0:e}function ao(e){return e.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lo{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const n=new io(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var U;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(U||(U={}));const co={debug:U.DEBUG,verbose:U.VERBOSE,info:U.INFO,warn:U.WARN,error:U.ERROR,silent:U.SILENT},fo=U.INFO,uo={[U.DEBUG]:"log",[U.VERBOSE]:"log",[U.INFO]:"info",[U.WARN]:"warn",[U.ERROR]:"error"},ho=(e,t,...n)=>{if(t<e.logLevel)return;const s=new Date().toISOString(),r=uo[t];if(r)console[r](`[${s}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class js{constructor(t){this.name=t,this._logLevel=fo,this._logHandler=ho,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in U))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?co[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,U.DEBUG,...t),this._logHandler(this,U.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,U.VERBOSE,...t),this._logHandler(this,U.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,U.INFO,...t),this._logHandler(this,U.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,U.WARN,...t),this._logHandler(this,U.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,U.ERROR,...t),this._logHandler(this,U.ERROR,...t)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(go(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function go(e){const t=e.getComponent();return(t==null?void 0:t.type)==="VERSION"}const En="@firebase/app",ks="0.7.12";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vn=new js("@firebase/app"),mo="@firebase/app-compat",bo="@firebase/analytics-compat",_o="@firebase/analytics",yo="@firebase/app-check-compat",Io="@firebase/app-check",wo="@firebase/auth",Eo="@firebase/auth-compat",vo="@firebase/database",Co="@firebase/database-compat",To="@firebase/functions",Ao="@firebase/functions-compat",xo="@firebase/installations",Oo="@firebase/installations-compat",Ro="@firebase/messaging",Fo="@firebase/messaging-compat",So="@firebase/performance",Po="@firebase/performance-compat",Mo="@firebase/remote-config",$o="@firebase/remote-config-compat",Do="@firebase/storage",No="@firebase/storage-compat",Lo="@firebase/firestore",jo="@firebase/firestore-compat",ko="firebase";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bs="[DEFAULT]",Bo={[En]:"fire-core",[mo]:"fire-core-compat",[_o]:"fire-analytics",[bo]:"fire-analytics-compat",[Io]:"fire-app-check",[yo]:"fire-app-check-compat",[wo]:"fire-auth",[Eo]:"fire-auth-compat",[vo]:"fire-rtdb",[Co]:"fire-rtdb-compat",[To]:"fire-fn",[Ao]:"fire-fn-compat",[xo]:"fire-iid",[Oo]:"fire-iid-compat",[Ro]:"fire-fcm",[Fo]:"fire-fcm-compat",[So]:"fire-perf",[Po]:"fire-perf-compat",[Mo]:"fire-rc",[$o]:"fire-rc-compat",[Do]:"fire-gcs",[No]:"fire-gcs-compat",[Lo]:"fire-fst",[jo]:"fire-fst-compat","fire-js":"fire-js",[ko]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt=new Map,Cn=new Map;function Ho(e,t){try{e.container.addComponent(t)}catch(n){vn.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function rt(e){const t=e.name;if(Cn.has(t))return vn.debug(`There were multiple attempts to register component ${t}.`),!1;Cn.set(t,e);for(const n of Lt.values())Ho(n,e);return!0}function jt(e,t){return e.container.getProvider(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uo={["no-app"]:"No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()",["bad-app-name"]:"Illegal App name: '{$appName}",["duplicate-app"]:"Firebase App named '{$appName}' already exists with different options or config",["app-deleted"]:"Firebase App named '{$appName}' already deleted",["invalid-app-argument"]:"firebase.{$appName}() takes either no argument or a Firebase App instance.",["invalid-log-argument"]:"First argument to `onLog` must be null or a function."},kt=new Dt("app","Firebase",Uo);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zo{constructor(t,n,s){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Le("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw kt.create("app-deleted",{appName:this._name})}}function Bf(e,t={}){typeof t!="object"&&(t={name:t});const n=Object.assign({name:Bs,automaticDataCollectionEnabled:!1},t),s=n.name;if(typeof s!="string"||!s)throw kt.create("bad-app-name",{appName:String(s)});const r=Lt.get(s);if(r){if(Nt(e,r.options)&&Nt(n,r.config))return r;throw kt.create("duplicate-app",{appName:s})}const i=new lo(s);for(const a of Cn.values())i.addComponent(a);const o=new zo(e,n,i);return Lt.set(s,o),o}function Ko(e=Bs){const t=Lt.get(e);if(!t)throw kt.create("no-app",{appName:e});return t}function Re(e,t,n){var s;let r=(s=Bo[e])!==null&&s!==void 0?s:e;n&&(r+=`-${n}`);const i=r.match(/\s|\//),o=t.match(/\s|\//);if(i||o){const a=[`Unable to register library "${r}" with version "${t}":`];i&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&o&&a.push("and"),o&&a.push(`version name "${t}" contains illegal characters (whitespace or "/")`),vn.warn(a.join(" "));return}rt(new Le(`${r}-version`,()=>({library:r,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qo(e){rt(new Le("platform-logger",t=>new po(t),"PRIVATE")),Re(En,ks,e),Re(En,ks,"esm2017"),Re("fire-js","")}qo("");var Vo="firebase",Wo="9.6.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Re(Vo,Wo,"app");function Yo(e){return Array.prototype.slice.call(e)}function Hs(e){return new Promise(function(t,n){e.onsuccess=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function Tn(e,t,n){var s,r=new Promise(function(i,o){s=e[t].apply(e,n),Hs(s).then(i,o)});return r.request=s,r}function Jo(e,t,n){var s=Tn(e,t,n);return s.then(function(r){if(!!r)return new Et(r,s.request)})}function it(e,t,n){n.forEach(function(s){Object.defineProperty(e.prototype,s,{get:function(){return this[t][s]},set:function(r){this[t][s]=r}})})}function An(e,t,n,s){s.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return Tn(this[t],r,arguments)})})}function Bt(e,t,n,s){s.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return this[t][r].apply(this[t],arguments)})})}function Us(e,t,n,s){s.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return Jo(this[t],r,arguments)})})}function ke(e){this._index=e}it(ke,"_index",["name","keyPath","multiEntry","unique"]);An(ke,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]);Us(ke,"_index",IDBIndex,["openCursor","openKeyCursor"]);function Et(e,t){this._cursor=e,this._request=t}it(Et,"_cursor",["direction","key","primaryKey","value"]);An(Et,"_cursor",IDBCursor,["update","delete"]);["advance","continue","continuePrimaryKey"].forEach(function(e){e in IDBCursor.prototype&&(Et.prototype[e]=function(){var t=this,n=arguments;return Promise.resolve().then(function(){return t._cursor[e].apply(t._cursor,n),Hs(t._request).then(function(s){if(!!s)return new Et(s,t._request)})})})});function _e(e){this._store=e}_e.prototype.createIndex=function(){return new ke(this._store.createIndex.apply(this._store,arguments))};_e.prototype.index=function(){return new ke(this._store.index.apply(this._store,arguments))};it(_e,"_store",["name","keyPath","indexNames","autoIncrement"]);An(_e,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]);Us(_e,"_store",IDBObjectStore,["openCursor","openKeyCursor"]);Bt(_e,"_store",IDBObjectStore,["deleteIndex"]);function vt(e){this._tx=e,this.complete=new Promise(function(t,n){e.oncomplete=function(){t()},e.onerror=function(){n(e.error)},e.onabort=function(){n(e.error)}})}vt.prototype.objectStore=function(){return new _e(this._tx.objectStore.apply(this._tx,arguments))};it(vt,"_tx",["objectStoreNames","mode"]);Bt(vt,"_tx",IDBTransaction,["abort"]);function Ht(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new vt(n)}Ht.prototype.createObjectStore=function(){return new _e(this._db.createObjectStore.apply(this._db,arguments))};it(Ht,"_db",["name","version","objectStoreNames"]);Bt(Ht,"_db",IDBDatabase,["deleteObjectStore","close"]);function Ut(e){this._db=e}Ut.prototype.transaction=function(){return new vt(this._db.transaction.apply(this._db,arguments))};it(Ut,"_db",["name","version","objectStoreNames"]);Bt(Ut,"_db",IDBDatabase,["close"]);["openCursor","openKeyCursor"].forEach(function(e){[_e,ke].forEach(function(t){e in t.prototype&&(t.prototype[e.replace("open","iterate")]=function(){var n=Yo(arguments),s=n[n.length-1],r=this._store||this._index,i=r[e].apply(r,n.slice(0,-1));i.onsuccess=function(){s(i.result)}})})});[ke,_e].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(t,n){var s=this,r=[];return new Promise(function(i){s.iterateCursor(t,function(o){if(!o){i(r);return}if(r.push(o.value),n!==void 0&&r.length==n){i(r);return}o.continue()})})})});function Go(e,t,n){var s=Tn(indexedDB,"open",[e,t]),r=s.request;return r&&(r.onupgradeneeded=function(i){n&&n(new Ht(r.result,i.oldVersion,r.transaction))}),s.then(function(i){return new Ut(i)})}const zs="@firebase/installations",xn="0.5.5";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ks=1e4,qs=`w:${xn}`,Vs="FIS_v2",Xo="https://firebaseinstallations.googleapis.com/v1",Zo=60*60*1e3,Qo="installations",ea="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ta={["missing-app-config-values"]:'Missing App configuration value: "{$valueName}"',["not-registered"]:"Firebase Installation is not registered.",["installation-not-found"]:"Firebase Installation not found.",["request-failed"]:'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',["app-offline"]:"Could not process request. Application offline.",["delete-pending-registration"]:"Can't delete installation while there is a pending registration request."},Be=new Dt(Qo,ea,ta);function Ws(e){return e instanceof wt&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ys({projectId:e}){return`${Xo}/projects/${e}/installations`}function Js(e){return{token:e.token,requestStatus:2,expiresIn:sa(e.expiresIn),creationTime:Date.now()}}async function Gs(e,t){const s=(await t.json()).error;return Be.create("request-failed",{requestName:e,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})}function Xs({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function na(e,{refreshToken:t}){const n=Xs(e);return n.append("Authorization",ra(t)),n}async function Zs(e){const t=await e();return t.status>=500&&t.status<600?e():t}function sa(e){return Number(e.replace("s","000"))}function ra(e){return`${Vs} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ia(e,{fid:t}){const n=Ys(e),s=Xs(e),r={fid:t,authVersion:Vs,appId:e.appId,sdkVersion:qs},i={method:"POST",headers:s,body:JSON.stringify(r)},o=await Zs(()=>fetch(n,i));if(o.ok){const a=await o.json();return{fid:a.fid||t,registrationStatus:2,refreshToken:a.refreshToken,authToken:Js(a.authToken)}}else throw await Gs("Create Installation",o)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qs(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oa(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aa=/^[cdef][\w-]{21}$/,On="";function la(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const n=ca(e);return aa.test(n)?n:On}catch{return On}}function ca(e){return oa(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zt(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const er=new Map;function tr(e,t){const n=zt(e);nr(n,t),fa(n,t)}function nr(e,t){const n=er.get(e);if(!!n)for(const s of n)s(t)}function fa(e,t){const n=ua();n&&n.postMessage({key:e,fid:t}),da()}let He=null;function ua(){return!He&&"BroadcastChannel"in self&&(He=new BroadcastChannel("[Firebase] FID Change"),He.onmessage=e=>{nr(e.data.key,e.data.fid)}),He}function da(){er.size===0&&He&&(He.close(),He=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ha="firebase-installations-database",pa=1,Ue="firebase-installations-store";let Rn=null;function Fn(){return Rn||(Rn=Go(ha,pa,e=>{switch(e.oldVersion){case 0:e.createObjectStore(Ue)}})),Rn}async function Kt(e,t){const n=zt(e),r=(await Fn()).transaction(Ue,"readwrite"),i=r.objectStore(Ue),o=await i.get(n);return await i.put(t,n),await r.complete,(!o||o.fid!==t.fid)&&tr(e,t.fid),t}async function sr(e){const t=zt(e),s=(await Fn()).transaction(Ue,"readwrite");await s.objectStore(Ue).delete(t),await s.complete}async function qt(e,t){const n=zt(e),r=(await Fn()).transaction(Ue,"readwrite"),i=r.objectStore(Ue),o=await i.get(n),a=t(o);return a===void 0?await i.delete(n):await i.put(a,n),await r.complete,a&&(!o||o.fid!==a.fid)&&tr(e,a.fid),a}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sn(e){let t;const n=await qt(e,s=>{const r=ga(s),i=ma(e,r);return t=i.registrationPromise,i.installationEntry});return n.fid===On?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function ga(e){const t=e||{fid:la(),registrationStatus:0};return ir(t)}function ma(e,t){if(t.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(Be.create("app-offline"));return{installationEntry:t,registrationPromise:r}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},s=ba(e,n);return{installationEntry:n,registrationPromise:s}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:_a(e)}:{installationEntry:t}}async function ba(e,t){try{const n=await ia(e,t);return Kt(e,n)}catch(n){throw Ws(n)&&n.customData.serverCode===409?await sr(e):await Kt(e,{fid:t.fid,registrationStatus:0}),n}}async function _a(e){let t=await rr(e);for(;t.registrationStatus===1;)await Qs(100),t=await rr(e);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:s}=await Sn(e);return s||n}return t}function rr(e){return qt(e,t=>{if(!t)throw Be.create("installation-not-found");return ir(t)})}function ir(e){return ya(e)?{fid:e.fid,registrationStatus:0}:e}function ya(e){return e.registrationStatus===1&&e.registrationTime+Ks<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ia({appConfig:e,platformLoggerProvider:t},n){const s=wa(e,n),r=na(e,n),i=t.getImmediate({optional:!0});i&&r.append("x-firebase-client",i.getPlatformInfoString());const o={installation:{sdkVersion:qs}},a={method:"POST",headers:r,body:JSON.stringify(o)},f=await Zs(()=>fetch(s,a));if(f.ok){const u=await f.json();return Js(u)}else throw await Gs("Generate Auth Token",f)}function wa(e,{fid:t}){return`${Ys(e)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pn(e,t=!1){let n;const s=await qt(e.appConfig,i=>{if(!ar(i))throw Be.create("not-registered");const o=i.authToken;if(!t&&Ca(o))return i;if(o.requestStatus===1)return n=Ea(e,t),i;{if(!navigator.onLine)throw Be.create("app-offline");const a=Aa(i);return n=va(e,a),a}});return n?await n:s.authToken}async function Ea(e,t){let n=await or(e.appConfig);for(;n.authToken.requestStatus===1;)await Qs(100),n=await or(e.appConfig);const s=n.authToken;return s.requestStatus===0?Pn(e,t):s}function or(e){return qt(e,t=>{if(!ar(t))throw Be.create("not-registered");const n=t.authToken;return xa(n)?Object.assign(Object.assign({},t),{authToken:{requestStatus:0}}):t})}async function va(e,t){try{const n=await Ia(e,t),s=Object.assign(Object.assign({},t),{authToken:n});return await Kt(e.appConfig,s),n}catch(n){if(Ws(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await sr(e.appConfig);else{const s=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await Kt(e.appConfig,s)}throw n}}function ar(e){return e!==void 0&&e.registrationStatus===2}function Ca(e){return e.requestStatus===2&&!Ta(e)}function Ta(e){const t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+Zo}function Aa(e){const t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}function xa(e){return e.requestStatus===1&&e.requestTime+Ks<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Oa(e){const t=e,{installationEntry:n,registrationPromise:s}=await Sn(t.appConfig);return s?s.catch(console.error):Pn(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ra(e,t=!1){const n=e;return await Fa(n.appConfig),(await Pn(n,t)).token}async function Fa(e){const{registrationPromise:t}=await Sn(e);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sa(e){if(!e||!e.options)throw Mn("App Configuration");if(!e.name)throw Mn("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!e.options[n])throw Mn(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function Mn(e){return Be.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr="installations",Pa="installations-internal",Ma=e=>{const t=e.getProvider("app").getImmediate(),n=Sa(t),s=jt(t,"platform-logger");return{app:t,appConfig:n,platformLoggerProvider:s,_delete:()=>Promise.resolve()}},$a=e=>{const t=e.getProvider("app").getImmediate(),n=jt(t,lr).getImmediate();return{getId:()=>Oa(n),getToken:r=>Ra(n,r)}};function Da(){rt(new Le(lr,Ma,"PUBLIC")),rt(new Le(Pa,$a,"PRIVATE"))}Da();Re(zs,xn);Re(zs,xn,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vt="analytics",Na="firebase_id",La="origin",ja=60*1e3,ka="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",cr="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oe=new js("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fr(e){return Promise.all(e.map(t=>t.catch(n=>n)))}function Ba(e,t){const n=document.createElement("script");n.src=`${cr}?l=${e}&id=${t}`,n.async=!0,document.head.appendChild(n)}function Ha(e){let t=[];return Array.isArray(window[e])?t=window[e]:window[e]=t,t}async function Ua(e,t,n,s,r,i){const o=s[r];try{if(o)await t[o];else{const f=(await fr(n)).find(u=>u.measurementId===r);f&&await t[f.appId]}}catch(a){oe.error(a)}e("config",r,i)}async function za(e,t,n,s,r){try{let i=[];if(r&&r.send_to){let o=r.send_to;Array.isArray(o)||(o=[o]);const a=await fr(n);for(const f of o){const u=a.find(I=>I.measurementId===f),g=u&&t[u.appId];if(g)i.push(g);else{i=[];break}}}i.length===0&&(i=Object.values(t)),await Promise.all(i),e("event",s,r||{})}catch(i){oe.error(i)}}function Ka(e,t,n,s){async function r(i,o,a){try{i==="event"?await za(e,t,n,o,a):i==="config"?await Ua(e,t,n,s,o,a):e("set",o)}catch(f){oe.error(f)}}return r}function qa(e,t,n,s,r){let i=function(...o){window[s].push(arguments)};return window[r]&&typeof window[r]=="function"&&(i=window[r]),window[r]=Ka(i,e,t,n),{gtagCore:i,wrappedGtag:window[r]}}function Va(){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(cr))return t;return null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa={["already-exists"]:"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.",["already-initialized"]:"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-intialized instance.",["already-initialized-settings"]:"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",["interop-component-reg-failed"]:"Firebase Analytics Interop Component failed to instantiate: {$reason}",["invalid-analytics-context"]:"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",["indexeddb-unavailable"]:"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",["fetch-throttle"]:"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.",["config-fetch-failed"]:"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}",["no-api-key"]:'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',["no-app-id"]:'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.'},fe=new Dt("analytics","Analytics",Wa);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ya=30,Ja=1e3;class Ga{constructor(t={},n=Ja){this.throttleMetadata=t,this.intervalMillis=n}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,n){this.throttleMetadata[t]=n}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const ur=new Ga;function Xa(e){return new Headers({Accept:"application/json","x-goog-api-key":e})}async function Za(e){var t;const{appId:n,apiKey:s}=e,r={method:"GET",headers:Xa(s)},i=ka.replace("{app-id}",n),o=await fetch(i,r);if(o.status!==200&&o.status!==304){let a="";try{const f=await o.json();((t=f.error)===null||t===void 0?void 0:t.message)&&(a=f.error.message)}catch{}throw fe.create("config-fetch-failed",{httpStatus:o.status,responseMessage:a})}return o.json()}async function Qa(e,t=ur,n){const{appId:s,apiKey:r,measurementId:i}=e.options;if(!s)throw fe.create("no-app-id");if(!r){if(i)return{measurementId:i,appId:s};throw fe.create("no-api-key")}const o=t.getThrottleMetadata(s)||{backoffCount:0,throttleEndTimeMillis:Date.now()},a=new nl;return setTimeout(async()=>{a.abort()},n!==void 0?n:ja),dr({appId:s,apiKey:r,measurementId:i},o,a,t)}async function dr(e,{throttleEndTimeMillis:t,backoffCount:n},s,r=ur){const{appId:i,measurementId:o}=e;try{await el(s,t)}catch(a){if(o)return oe.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${a.message}]`),{appId:i,measurementId:o};throw a}try{const a=await Za(e);return r.deleteThrottleMetadata(i),a}catch(a){if(!tl(a)){if(r.deleteThrottleMetadata(i),o)return oe.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${a.message}]`),{appId:i,measurementId:o};throw a}const f=Number(a.customData.httpStatus)===503?Ns(n,r.intervalMillis,Ya):Ns(n,r.intervalMillis),u={throttleEndTimeMillis:Date.now()+f,backoffCount:n+1};return r.setThrottleMetadata(i,u),oe.debug(`Calling attemptFetch again in ${f} millis`),dr(e,u,s,r)}}function el(e,t){return new Promise((n,s)=>{const r=Math.max(t-Date.now(),0),i=setTimeout(n,r);e.addEventListener(()=>{clearTimeout(i),s(fe.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function tl(e){if(!(e instanceof wt)||!e.customData)return!1;const t=Number(e.customData.httpStatus);return t===429||t===500||t===503||t===504}class nl{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function sl(){if(Ji())try{await Gi()}catch(e){return oe.warn(fe.create("indexeddb-unavailable",{errorInfo:e}).message),!1}else return oe.warn(fe.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function rl(e,t,n,s,r,i,o){var a;const f=Qa(e);f.then(A=>{n[A.measurementId]=A.appId,e.options.measurementId&&A.measurementId!==e.options.measurementId&&oe.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${A.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(A=>oe.error(A)),t.push(f);const u=sl().then(A=>{if(A)return s.getId()}),[g,I]=await Promise.all([f,u]);Va()||Ba(i,g.measurementId),r("js",new Date);const w=(a=o==null?void 0:o.config)!==null&&a!==void 0?a:{};return w[La]="firebase",w.update=!0,I!=null&&(w[Na]=I),r("config",g.measurementId,w),g.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class il{constructor(t){this.app=t}_delete(){return delete Ct[this.app.options.appId],Promise.resolve()}}let Ct={},hr=[];const pr={};let $n="dataLayer",ol="gtag",gr,mr,br=!1;function al(){const e=[];if(Yi()&&e.push("This is a browser extension environment."),Xi()||e.push("Cookies are not available."),e.length>0){const t=e.map((s,r)=>`(${r+1}) ${s}`).join(" "),n=fe.create("invalid-analytics-context",{errorInfo:t});oe.warn(n.message)}}function ll(e,t,n){al();const s=e.options.appId;if(!s)throw fe.create("no-app-id");if(!e.options.apiKey)if(e.options.measurementId)oe.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw fe.create("no-api-key");if(Ct[s]!=null)throw fe.create("already-exists",{id:s});if(!br){Ha($n);const{wrappedGtag:i,gtagCore:o}=qa(Ct,hr,pr,$n,ol);mr=i,gr=o,br=!0}return Ct[s]=rl(e,hr,pr,t,gr,$n,n),new il(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cl(e,t,n,s,r){if(r&&r.global){e("event",n,s);return}else{const i=await t,o=Object.assign(Object.assign({},s),{send_to:i});e("event",n,o)}}function Hf(e=Ko()){e=Ls(e);const t=jt(e,Vt);return t.isInitialized()?t.getImmediate():fl(e)}function fl(e,t={}){const n=jt(e,Vt);if(n.isInitialized()){const r=n.getImmediate();if(Nt(t,n.getOptions()))return r;throw fe.create("already-initialized")}return n.initialize({options:t})}function ul(e,t,n,s){e=Ls(e),cl(mr,Ct[e.app.options.appId],t,n,s).catch(r=>oe.error(r))}const _r="@firebase/analytics",yr="0.7.5";function dl(){rt(new Le(Vt,(t,{options:n})=>{const s=t.getProvider("app").getImmediate(),r=t.getProvider("installations-internal").getImmediate();return ll(s,r,n)},"PUBLIC")),rt(new Le("analytics-internal",e,"PRIVATE")),Re(_r,yr),Re(_r,yr,"esm2017");function e(t){try{const n=t.getProvider(Vt).getImmediate();return{logEvent:(s,r,i)=>ul(n,s,r,i)}}catch(n){throw fe.create("interop-component-reg-failed",{reason:n})}}}dl();function Dn(e,t){const n=Object.create(null),s=e.split(",");for(let r=0;r<s.length;r++)n[s[r]]=!0;return t?r=>!!n[r.toLowerCase()]:r=>!!n[r]}const hl="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",pl=Dn(hl);function Ir(e){return!!e||e===""}function Nn(e){if(O(e)){const t={};for(let n=0;n<e.length;n++){const s=e[n],r=Z(s)?bl(s):Nn(s);if(r)for(const i in r)t[i]=r[i]}return t}else{if(Z(e))return e;if(J(e))return e}}const gl=/;(?![^(]*\))/g,ml=/:(.+)/;function bl(e){const t={};return e.split(gl).forEach(n=>{if(n){const s=n.split(ml);s.length>1&&(t[s[0].trim()]=s[1].trim())}}),t}function Ln(e){let t="";if(Z(e))t=e;else if(O(e))for(let n=0;n<e.length;n++){const s=Ln(e[n]);s&&(t+=s+" ")}else if(J(e))for(const n in e)e[n]&&(t+=n+" ");return t.trim()}const Uf=e=>e==null?"":O(e)||J(e)&&(e.toString===Cr||!F(e.toString))?JSON.stringify(e,wr,2):String(e),wr=(e,t)=>t&&t.__v_isRef?wr(e,t.value):at(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((n,[s,r])=>(n[`${s} =>`]=r,n),{})}:Er(t)?{[`Set(${t.size})`]:[...t.values()]}:J(t)&&!O(t)&&!Tr(t)?String(t):t,k={},ot=[],me=()=>{},_l=()=>!1,yl=/^on[^a-z]/,Wt=e=>yl.test(e),jn=e=>e.startsWith("onUpdate:"),X=Object.assign,kn=(e,t)=>{const n=e.indexOf(t);n>-1&&e.splice(n,1)},Il=Object.prototype.hasOwnProperty,P=(e,t)=>Il.call(e,t),O=Array.isArray,at=e=>Yt(e)==="[object Map]",Er=e=>Yt(e)==="[object Set]",F=e=>typeof e=="function",Z=e=>typeof e=="string",Bn=e=>typeof e=="symbol",J=e=>e!==null&&typeof e=="object",vr=e=>J(e)&&F(e.then)&&F(e.catch),Cr=Object.prototype.toString,Yt=e=>Cr.call(e),wl=e=>Yt(e).slice(8,-1),Tr=e=>Yt(e)==="[object Object]",Hn=e=>Z(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,Jt=Dn(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Gt=e=>{const t=Object.create(null);return n=>t[n]||(t[n]=e(n))},El=/-(\w)/g,lt=Gt(e=>e.replace(El,(t,n)=>n?n.toUpperCase():"")),vl=/\B([A-Z])/g,ct=Gt(e=>e.replace(vl,"-$1").toLowerCase()),Ar=Gt(e=>e.charAt(0).toUpperCase()+e.slice(1)),Un=Gt(e=>e?`on${Ar(e)}`:""),Tt=(e,t)=>!Object.is(e,t),zn=(e,t)=>{for(let n=0;n<e.length;n++)e[n](t)},Xt=(e,t,n)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,value:n})},Cl=e=>{const t=parseFloat(e);return isNaN(t)?e:t};let xr;const Tl=()=>xr||(xr=typeof globalThis!="undefined"?globalThis:typeof self!="undefined"?self:typeof window!="undefined"?window:typeof global!="undefined"?global:{});let ze;const Zt=[];class Al{constructor(t=!1){this.active=!0,this.effects=[],this.cleanups=[],!t&&ze&&(this.parent=ze,this.index=(ze.scopes||(ze.scopes=[])).push(this)-1)}run(t){if(this.active)try{return this.on(),t()}finally{this.off()}}on(){this.active&&(Zt.push(this),ze=this)}off(){this.active&&(Zt.pop(),ze=Zt[Zt.length-1])}stop(t){if(this.active){if(this.effects.forEach(n=>n.stop()),this.cleanups.forEach(n=>n()),this.scopes&&this.scopes.forEach(n=>n.stop(!0)),this.parent&&!t){const n=this.parent.scopes.pop();n&&n!==this&&(this.parent.scopes[this.index]=n,n.index=this.index)}this.active=!1}}}function xl(e,t){t=t||ze,t&&t.active&&t.effects.push(e)}const Kn=e=>{const t=new Set(e);return t.w=0,t.n=0,t},Or=e=>(e.w&Fe)>0,Rr=e=>(e.n&Fe)>0,Ol=({deps:e})=>{if(e.length)for(let t=0;t<e.length;t++)e[t].w|=Fe},Rl=e=>{const{deps:t}=e;if(t.length){let n=0;for(let s=0;s<t.length;s++){const r=t[s];Or(r)&&!Rr(r)?r.delete(e):t[n++]=r,r.w&=~Fe,r.n&=~Fe}t.length=n}},qn=new WeakMap;let At=0,Fe=1;const Vn=30,xt=[];let Ke;const qe=Symbol(""),Wn=Symbol("");class Yn{constructor(t,n=null,s){this.fn=t,this.scheduler=n,this.active=!0,this.deps=[],xl(this,s)}run(){if(!this.active)return this.fn();if(!xt.includes(this))try{return xt.push(Ke=this),Fl(),Fe=1<<++At,At<=Vn?Ol(this):Fr(this),this.fn()}finally{At<=Vn&&Rl(this),Fe=1<<--At,Ve(),xt.pop();const t=xt.length;Ke=t>0?xt[t-1]:void 0}}stop(){this.active&&(Fr(this),this.onStop&&this.onStop(),this.active=!1)}}function Fr(e){const{deps:t}=e;if(t.length){for(let n=0;n<t.length;n++)t[n].delete(e);t.length=0}}let ft=!0;const Jn=[];function ut(){Jn.push(ft),ft=!1}function Fl(){Jn.push(ft),ft=!0}function Ve(){const e=Jn.pop();ft=e===void 0?!0:e}function ae(e,t,n){if(!Sr())return;let s=qn.get(e);s||qn.set(e,s=new Map);let r=s.get(n);r||s.set(n,r=Kn()),Pr(r)}function Sr(){return ft&&Ke!==void 0}function Pr(e,t){let n=!1;At<=Vn?Rr(e)||(e.n|=Fe,n=!Or(e)):n=!e.has(Ke),n&&(e.add(Ke),Ke.deps.push(e))}function Te(e,t,n,s,r,i){const o=qn.get(e);if(!o)return;let a=[];if(t==="clear")a=[...o.values()];else if(n==="length"&&O(e))o.forEach((f,u)=>{(u==="length"||u>=s)&&a.push(f)});else switch(n!==void 0&&a.push(o.get(n)),t){case"add":O(e)?Hn(n)&&a.push(o.get("length")):(a.push(o.get(qe)),at(e)&&a.push(o.get(Wn)));break;case"delete":O(e)||(a.push(o.get(qe)),at(e)&&a.push(o.get(Wn)));break;case"set":at(e)&&a.push(o.get(qe));break}if(a.length===1)a[0]&&Gn(a[0]);else{const f=[];for(const u of a)u&&f.push(...u);Gn(Kn(f))}}function Gn(e,t){for(const n of O(e)?e:[...e])(n!==Ke||n.allowRecurse)&&(n.scheduler?n.scheduler():n.run())}const Sl=Dn("__proto__,__v_isRef,__isVue"),Mr=new Set(Object.getOwnPropertyNames(Symbol).map(e=>Symbol[e]).filter(Bn)),Pl=Xn(),Ml=Xn(!1,!0),$l=Xn(!0),$r=Dl();function Dl(){const e={};return["includes","indexOf","lastIndexOf"].forEach(t=>{e[t]=function(...n){const s=M(this);for(let i=0,o=this.length;i<o;i++)ae(s,"get",i+"");const r=s[t](...n);return r===-1||r===!1?s[t](...n.map(M)):r}}),["push","pop","shift","unshift","splice"].forEach(t=>{e[t]=function(...n){ut();const s=M(this)[t].apply(this,n);return Ve(),s}}),e}function Xn(e=!1,t=!1){return function(s,r,i){if(r==="__v_isReactive")return!e;if(r==="__v_isReadonly")return e;if(r==="__v_raw"&&i===(e?t?Xl:zr:t?Ur:Hr).get(s))return s;const o=O(s);if(!e&&o&&P($r,r))return Reflect.get($r,r,i);const a=Reflect.get(s,r,i);return(Bn(r)?Mr.has(r):Sl(r))||(e||ae(s,"get",r),t)?a:Q(a)?!o||!Hn(r)?a.value:a:J(a)?e?Kr(a):es(a):a}}const Nl=Dr(),Ll=Dr(!0);function Dr(e=!1){return function(n,s,r,i){let o=n[s];if(!e&&!ns(r)&&(r=M(r),o=M(o),!O(n)&&Q(o)&&!Q(r)))return o.value=r,!0;const a=O(n)&&Hn(s)?Number(s)<n.length:P(n,s),f=Reflect.set(n,s,r,i);return n===M(i)&&(a?Tt(r,o)&&Te(n,"set",s,r):Te(n,"add",s,r)),f}}function jl(e,t){const n=P(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&n&&Te(e,"delete",t,void 0),s}function kl(e,t){const n=Reflect.has(e,t);return(!Bn(t)||!Mr.has(t))&&ae(e,"has",t),n}function Bl(e){return ae(e,"iterate",O(e)?"length":qe),Reflect.ownKeys(e)}const Nr={get:Pl,set:Nl,deleteProperty:jl,has:kl,ownKeys:Bl},Hl={get:$l,set(e,t){return!0},deleteProperty(e,t){return!0}},Ul=X({},Nr,{get:Ml,set:Ll}),Zn=e=>e,Qt=e=>Reflect.getPrototypeOf(e);function en(e,t,n=!1,s=!1){e=e.__v_raw;const r=M(e),i=M(t);t!==i&&!n&&ae(r,"get",t),!n&&ae(r,"get",i);const{has:o}=Qt(r),a=s?Zn:n?ss:Ot;if(o.call(r,t))return a(e.get(t));if(o.call(r,i))return a(e.get(i));e!==r&&e.get(t)}function tn(e,t=!1){const n=this.__v_raw,s=M(n),r=M(e);return e!==r&&!t&&ae(s,"has",e),!t&&ae(s,"has",r),e===r?n.has(e):n.has(e)||n.has(r)}function nn(e,t=!1){return e=e.__v_raw,!t&&ae(M(e),"iterate",qe),Reflect.get(e,"size",e)}function Lr(e){e=M(e);const t=M(this);return Qt(t).has.call(t,e)||(t.add(e),Te(t,"add",e,e)),this}function jr(e,t){t=M(t);const n=M(this),{has:s,get:r}=Qt(n);let i=s.call(n,e);i||(e=M(e),i=s.call(n,e));const o=r.call(n,e);return n.set(e,t),i?Tt(t,o)&&Te(n,"set",e,t):Te(n,"add",e,t),this}function kr(e){const t=M(this),{has:n,get:s}=Qt(t);let r=n.call(t,e);r||(e=M(e),r=n.call(t,e)),s&&s.call(t,e);const i=t.delete(e);return r&&Te(t,"delete",e,void 0),i}function Br(){const e=M(this),t=e.size!==0,n=e.clear();return t&&Te(e,"clear",void 0,void 0),n}function sn(e,t){return function(s,r){const i=this,o=i.__v_raw,a=M(o),f=t?Zn:e?ss:Ot;return!e&&ae(a,"iterate",qe),o.forEach((u,g)=>s.call(r,f(u),f(g),i))}}function rn(e,t,n){return function(...s){const r=this.__v_raw,i=M(r),o=at(i),a=e==="entries"||e===Symbol.iterator&&o,f=e==="keys"&&o,u=r[e](...s),g=n?Zn:t?ss:Ot;return!t&&ae(i,"iterate",f?Wn:qe),{next(){const{value:I,done:w}=u.next();return w?{value:I,done:w}:{value:a?[g(I[0]),g(I[1])]:g(I),done:w}},[Symbol.iterator](){return this}}}}function Se(e){return function(...t){return e==="delete"?!1:this}}function zl(){const e={get(i){return en(this,i)},get size(){return nn(this)},has:tn,add:Lr,set:jr,delete:kr,clear:Br,forEach:sn(!1,!1)},t={get(i){return en(this,i,!1,!0)},get size(){return nn(this)},has:tn,add:Lr,set:jr,delete:kr,clear:Br,forEach:sn(!1,!0)},n={get(i){return en(this,i,!0)},get size(){return nn(this,!0)},has(i){return tn.call(this,i,!0)},add:Se("add"),set:Se("set"),delete:Se("delete"),clear:Se("clear"),forEach:sn(!0,!1)},s={get(i){return en(this,i,!0,!0)},get size(){return nn(this,!0)},has(i){return tn.call(this,i,!0)},add:Se("add"),set:Se("set"),delete:Se("delete"),clear:Se("clear"),forEach:sn(!0,!0)};return["keys","values","entries",Symbol.iterator].forEach(i=>{e[i]=rn(i,!1,!1),n[i]=rn(i,!0,!1),t[i]=rn(i,!1,!0),s[i]=rn(i,!0,!0)}),[e,n,t,s]}const[Kl,ql,Vl,Wl]=zl();function Qn(e,t){const n=t?e?Wl:Vl:e?ql:Kl;return(s,r,i)=>r==="__v_isReactive"?!e:r==="__v_isReadonly"?e:r==="__v_raw"?s:Reflect.get(P(n,r)&&r in s?n:s,r,i)}const Yl={get:Qn(!1,!1)},Jl={get:Qn(!1,!0)},Gl={get:Qn(!0,!1)},Hr=new WeakMap,Ur=new WeakMap,zr=new WeakMap,Xl=new WeakMap;function Zl(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Ql(e){return e.__v_skip||!Object.isExtensible(e)?0:Zl(wl(e))}function es(e){return e&&e.__v_isReadonly?e:ts(e,!1,Nr,Yl,Hr)}function ec(e){return ts(e,!1,Ul,Jl,Ur)}function Kr(e){return ts(e,!0,Hl,Gl,zr)}function ts(e,t,n,s,r){if(!J(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const i=r.get(e);if(i)return i;const o=Ql(e);if(o===0)return e;const a=new Proxy(e,o===2?s:n);return r.set(e,a),a}function dt(e){return ns(e)?dt(e.__v_raw):!!(e&&e.__v_isReactive)}function ns(e){return!!(e&&e.__v_isReadonly)}function qr(e){return dt(e)||ns(e)}function M(e){const t=e&&e.__v_raw;return t?M(t):e}function Vr(e){return Xt(e,"__v_skip",!0),e}const Ot=e=>J(e)?es(e):e,ss=e=>J(e)?Kr(e):e;function Wr(e){Sr()&&(e=M(e),e.dep||(e.dep=Kn()),Pr(e.dep))}function Yr(e,t){e=M(e),e.dep&&Gn(e.dep)}function Q(e){return Boolean(e&&e.__v_isRef===!0)}function zf(e){return tc(e,!1)}function tc(e,t){return Q(e)?e:new nc(e,t)}class nc{constructor(t,n){this._shallow=n,this.dep=void 0,this.__v_isRef=!0,this._rawValue=n?t:M(t),this._value=n?t:Ot(t)}get value(){return Wr(this),this._value}set value(t){t=this._shallow?t:M(t),Tt(t,this._rawValue)&&(this._rawValue=t,this._value=this._shallow?t:Ot(t),Yr(this))}}function sc(e){return Q(e)?e.value:e}const rc={get:(e,t,n)=>sc(Reflect.get(e,t,n)),set:(e,t,n,s)=>{const r=e[t];return Q(r)&&!Q(n)?(r.value=n,!0):Reflect.set(e,t,n,s)}};function Jr(e){return dt(e)?e:new Proxy(e,rc)}class ic{constructor(t,n,s){this._setter=n,this.dep=void 0,this._dirty=!0,this.__v_isRef=!0,this.effect=new Yn(t,()=>{this._dirty||(this._dirty=!0,Yr(this))}),this.__v_isReadonly=s}get value(){const t=M(this);return Wr(t),t._dirty&&(t._dirty=!1,t._value=t.effect.run()),t._value}set value(t){this._setter(t)}}function oc(e,t){let n,s;const r=F(e);return r?(n=e,s=me):(n=e.get,s=e.set),new ic(n,s,r||!s)}Promise.resolve();function ac(e,t,...n){const s=e.vnode.props||k;let r=n;const i=t.startsWith("update:"),o=i&&t.slice(7);if(o&&o in s){const g=`${o==="modelValue"?"model":o}Modifiers`,{number:I,trim:w}=s[g]||k;w?r=n.map(A=>A.trim()):I&&(r=n.map(Cl))}let a,f=s[a=Un(t)]||s[a=Un(lt(t))];!f&&i&&(f=s[a=Un(ct(t))]),f&&de(f,e,6,r);const u=s[a+"Once"];if(u){if(!e.emitted)e.emitted={};else if(e.emitted[a])return;e.emitted[a]=!0,de(u,e,6,r)}}function Gr(e,t,n=!1){const s=t.emitsCache,r=s.get(e);if(r!==void 0)return r;const i=e.emits;let o={},a=!1;if(!F(e)){const f=u=>{const g=Gr(u,t,!0);g&&(a=!0,X(o,g))};!n&&t.mixins.length&&t.mixins.forEach(f),e.extends&&f(e.extends),e.mixins&&e.mixins.forEach(f)}return!i&&!a?(s.set(e,null),null):(O(i)?i.forEach(f=>o[f]=null):X(o,i),s.set(e,o),o)}function rs(e,t){return!e||!Wt(t)?!1:(t=t.slice(2).replace(/Once$/,""),P(e,t[0].toLowerCase()+t.slice(1))||P(e,ct(t))||P(e,t))}let ye=null,Xr=null;function on(e){const t=ye;return ye=e,Xr=e&&e.type.__scopeId||null,t}function lc(e,t=ye,n){if(!t||e._n)return e;const s=(...r)=>{s._d&&wi(-1);const i=on(t),o=e(...r);return on(i),s._d&&wi(1),o};return s._n=!0,s._c=!0,s._d=!0,s}function is(e){const{type:t,vnode:n,proxy:s,withProxy:r,props:i,propsOptions:[o],slots:a,attrs:f,emit:u,render:g,renderCache:I,data:w,setupState:A,ctx:D,inheritAttrs:N}=e;let R,$;const ce=on(e);try{if(n.shapeFlag&4){const q=r||s;R=we(g.call(q,q,I,i,A,w,D)),$=f}else{const q=t;R=we(q.length>1?q(i,{attrs:f,slots:a,emit:u}):q(i,null)),$=t.props?f:cc(f)}}catch(q){Rt.length=0,gn(q,e,1),R=Ze(Pe)}let W=R;if($&&N!==!1){const q=Object.keys($),{shapeFlag:se}=W;q.length&&se&(1|6)&&(o&&q.some(jn)&&($=fc($,o)),W=ht(W,$))}return n.dirs&&(W.dirs=W.dirs?W.dirs.concat(n.dirs):n.dirs),n.transition&&(W.transition=n.transition),R=W,on(ce),R}const cc=e=>{let t;for(const n in e)(n==="class"||n==="style"||Wt(n))&&((t||(t={}))[n]=e[n]);return t},fc=(e,t)=>{const n={};for(const s in e)(!jn(s)||!(s.slice(9)in t))&&(n[s]=e[s]);return n};function uc(e,t,n){const{props:s,children:r,component:i}=e,{props:o,children:a,patchFlag:f}=t,u=i.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&f>=0){if(f&1024)return!0;if(f&16)return s?Zr(s,o,u):!!o;if(f&8){const g=t.dynamicProps;for(let I=0;I<g.length;I++){const w=g[I];if(o[w]!==s[w]&&!rs(u,w))return!0}}}else return(r||a)&&(!a||!a.$stable)?!0:s===o?!1:s?o?Zr(s,o,u):!0:!!o;return!1}function Zr(e,t,n){const s=Object.keys(t);if(s.length!==Object.keys(e).length)return!0;for(let r=0;r<s.length;r++){const i=s[r];if(t[i]!==e[i]&&!rs(n,i))return!0}return!1}function dc({vnode:e,parent:t},n){for(;t&&t.subTree===e;)(e=t.vnode).el=n,t=t.parent}const hc=e=>e.__isSuspense;function pc(e,t){t&&t.pendingBranch?O(e)?t.effects.push(...e):t.effects.push(e):gf(e)}function gc(e,t){if(G){let n=G.provides;const s=G.parent&&G.parent.provides;s===n&&(n=G.provides=Object.create(s)),n[e]=t}}function os(e,t,n=!1){const s=G||ye;if(s){const r=s.parent==null?s.vnode.appContext&&s.vnode.appContext.provides:s.parent.provides;if(r&&e in r)return r[e];if(arguments.length>1)return n&&F(t)?t.call(s.proxy):t}}function mc(){const e={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return si(()=>{e.isMounted=!0}),ri(()=>{e.isUnmounting=!0}),e}const ue=[Function,Array],bc={name:"BaseTransition",props:{mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:ue,onEnter:ue,onAfterEnter:ue,onEnterCancelled:ue,onBeforeLeave:ue,onLeave:ue,onAfterLeave:ue,onLeaveCancelled:ue,onBeforeAppear:ue,onAppear:ue,onAfterAppear:ue,onAppearCancelled:ue},setup(e,{slots:t}){const n=sf(),s=mc();let r;return()=>{const i=t.default&&ti(t.default(),!0);if(!i||!i.length)return;const o=M(e),{mode:a}=o,f=i[0];if(s.isLeaving)return ls(f);const u=ei(f);if(!u)return ls(f);const g=as(u,o,s,n);cs(u,g);const I=n.subTree,w=I&&ei(I);let A=!1;const{getTransitionKey:D}=u.type;if(D){const N=D();r===void 0?r=N:N!==r&&(r=N,A=!0)}if(w&&w.type!==Pe&&(!Xe(u,w)||A)){const N=as(w,o,s,n);if(cs(w,N),a==="out-in")return s.isLeaving=!0,N.afterLeave=()=>{s.isLeaving=!1,n.update()},ls(f);a==="in-out"&&u.type!==Pe&&(N.delayLeave=(R,$,ce)=>{const W=Qr(s,w);W[String(w.key)]=w,R._leaveCb=()=>{$(),R._leaveCb=void 0,delete g.delayedLeave},g.delayedLeave=ce})}return f}}},_c=bc;function Qr(e,t){const{leavingVNodes:n}=e;let s=n.get(t.type);return s||(s=Object.create(null),n.set(t.type,s)),s}function as(e,t,n,s){const{appear:r,mode:i,persisted:o=!1,onBeforeEnter:a,onEnter:f,onAfterEnter:u,onEnterCancelled:g,onBeforeLeave:I,onLeave:w,onAfterLeave:A,onLeaveCancelled:D,onBeforeAppear:N,onAppear:R,onAfterAppear:$,onAppearCancelled:ce}=t,W=String(e.key),q=Qr(n,e),se=(L,Y)=>{L&&de(L,s,9,Y)},Ne={mode:i,persisted:o,beforeEnter(L){let Y=a;if(!n.isMounted)if(r)Y=N||a;else return;L._leaveCb&&L._leaveCb(!0);const V=q[W];V&&Xe(e,V)&&V.el._leaveCb&&V.el._leaveCb(),se(Y,[L])},enter(L){let Y=f,V=u,he=g;if(!n.isMounted)if(r)Y=R||f,V=$||u,he=ce||g;else return;let re=!1;const pe=L._enterCb=et=>{re||(re=!0,et?se(he,[L]):se(V,[L]),Ne.delayedLeave&&Ne.delayedLeave(),L._enterCb=void 0)};Y?(Y(L,pe),Y.length<=1&&pe()):pe()},leave(L,Y){const V=String(e.key);if(L._enterCb&&L._enterCb(!0),n.isUnmounting)return Y();se(I,[L]);let he=!1;const re=L._leaveCb=pe=>{he||(he=!0,Y(),pe?se(D,[L]):se(A,[L]),L._leaveCb=void 0,q[V]===e&&delete q[V])};q[V]=e,w?(w(L,re),w.length<=1&&re()):re()},clone(L){return as(L,t,n,s)}};return Ne}function ls(e){if(an(e))return e=ht(e),e.children=null,e}function ei(e){return an(e)?e.children?e.children[0]:void 0:e}function cs(e,t){e.shapeFlag&6&&e.component?cs(e.component.subTree,t):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function ti(e,t=!1){let n=[],s=0;for(let r=0;r<e.length;r++){const i=e[r];i.type===Ie?(i.patchFlag&128&&s++,n=n.concat(ti(i.children,t))):(t||i.type!==Pe)&&n.push(i)}if(s>1)for(let r=0;r<n.length;r++)n[r].patchFlag=-2;return n}const fs=e=>!!e.type.__asyncLoader,an=e=>e.type.__isKeepAlive;function yc(e,t){ni(e,"a",t)}function Ic(e,t){ni(e,"da",t)}function ni(e,t,n=G){const s=e.__wdc||(e.__wdc=()=>{let r=n;for(;r;){if(r.isDeactivated)return;r=r.parent}return e()});if(ln(t,s,n),n){let r=n.parent;for(;r&&r.parent;)an(r.parent.vnode)&&wc(s,t,n,r),r=r.parent}}function wc(e,t,n,s){const r=ln(t,e,s,!0);ii(()=>{kn(s[t],r)},n)}function ln(e,t,n=G,s=!1){if(n){const r=n[e]||(n[e]=[]),i=t.__weh||(t.__weh=(...o)=>{if(n.isUnmounted)return;ut(),pt(n);const a=de(t,n,e,o);return Qe(),Ve(),a});return s?r.unshift(i):r.push(i),i}}const Ae=e=>(t,n=G)=>(!pn||e==="sp")&&ln(e,t,n),Ec=Ae("bm"),si=Ae("m"),vc=Ae("bu"),Cc=Ae("u"),ri=Ae("bum"),ii=Ae("um"),Tc=Ae("sp"),Ac=Ae("rtg"),xc=Ae("rtc");function Oc(e,t=G){ln("ec",e,t)}let us=!0;function Rc(e){const t=li(e),n=e.proxy,s=e.ctx;us=!1,t.beforeCreate&&oi(t.beforeCreate,e,"bc");const{data:r,computed:i,methods:o,watch:a,provide:f,inject:u,created:g,beforeMount:I,mounted:w,beforeUpdate:A,updated:D,activated:N,deactivated:R,beforeDestroy:$,beforeUnmount:ce,destroyed:W,unmounted:q,render:se,renderTracked:Ne,renderTriggered:L,errorCaptured:Y,serverPrefetch:V,expose:he,inheritAttrs:re,components:pe,directives:et,filters:Rs}=t;if(u&&Fc(u,s,null,e.appContext.config.unwrapInjectedRef),o)for(const K in o){const B=o[K];F(B)&&(s[K]=B.bind(n))}if(r){const K=r.call(n,n);J(K)&&(e.data=es(K))}if(us=!0,i)for(const K in i){const B=i[K],ve=F(B)?B.bind(n,n):F(B.get)?B.get.bind(n,n):me,yn=!F(B)&&F(B.set)?B.set.bind(n):me,yt=oc({get:ve,set:yn});Object.defineProperty(s,K,{enumerable:!0,configurable:!0,get:()=>yt.value,set:tt=>yt.value=tt})}if(a)for(const K in a)ai(a[K],s,n,K);if(f){const K=F(f)?f.call(n):f;Reflect.ownKeys(K).forEach(B=>{gc(B,K[B])})}g&&oi(g,e,"c");function te(K,B){O(B)?B.forEach(ve=>K(ve.bind(n))):B&&K(B.bind(n))}if(te(Ec,I),te(si,w),te(vc,A),te(Cc,D),te(yc,N),te(Ic,R),te(Oc,Y),te(xc,Ne),te(Ac,L),te(ri,ce),te(ii,q),te(Tc,V),O(he))if(he.length){const K=e.exposed||(e.exposed={});he.forEach(B=>{Object.defineProperty(K,B,{get:()=>n[B],set:ve=>n[B]=ve})})}else e.exposed||(e.exposed={});se&&e.render===me&&(e.render=se),re!=null&&(e.inheritAttrs=re),pe&&(e.components=pe),et&&(e.directives=et)}function Fc(e,t,n=me,s=!1){O(e)&&(e=ds(e));for(const r in e){const i=e[r];let o;J(i)?"default"in i?o=os(i.from||r,i.default,!0):o=os(i.from||r):o=os(i),Q(o)&&s?Object.defineProperty(t,r,{enumerable:!0,configurable:!0,get:()=>o.value,set:a=>o.value=a}):t[r]=o}}function oi(e,t,n){de(O(e)?e.map(s=>s.bind(t.proxy)):e.bind(t.proxy),t,n)}function ai(e,t,n,s){const r=s.includes(".")?Ni(n,s):()=>n[s];if(Z(e)){const i=t[e];F(i)&&Ts(r,i)}else if(F(e))Ts(r,e.bind(n));else if(J(e))if(O(e))e.forEach(i=>ai(i,t,n,s));else{const i=F(e.handler)?e.handler.bind(n):t[e.handler];F(i)&&Ts(r,i,e)}}function li(e){const t=e.type,{mixins:n,extends:s}=t,{mixins:r,optionsCache:i,config:{optionMergeStrategies:o}}=e.appContext,a=i.get(t);let f;return a?f=a:!r.length&&!n&&!s?f=t:(f={},r.length&&r.forEach(u=>cn(f,u,o,!0)),cn(f,t,o)),i.set(t,f),f}function cn(e,t,n,s=!1){const{mixins:r,extends:i}=t;i&&cn(e,i,n,!0),r&&r.forEach(o=>cn(e,o,n,!0));for(const o in t)if(!(s&&o==="expose")){const a=Sc[o]||n&&n[o];e[o]=a?a(e[o],t[o]):t[o]}return e}const Sc={data:ci,props:We,emits:We,methods:We,computed:We,beforeCreate:ee,created:ee,beforeMount:ee,mounted:ee,beforeUpdate:ee,updated:ee,beforeDestroy:ee,beforeUnmount:ee,destroyed:ee,unmounted:ee,activated:ee,deactivated:ee,errorCaptured:ee,serverPrefetch:ee,components:We,directives:We,watch:Mc,provide:ci,inject:Pc};function ci(e,t){return t?e?function(){return X(F(e)?e.call(this,this):e,F(t)?t.call(this,this):t)}:t:e}function Pc(e,t){return We(ds(e),ds(t))}function ds(e){if(O(e)){const t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function ee(e,t){return e?[...new Set([].concat(e,t))]:t}function We(e,t){return e?X(X(Object.create(null),e),t):t}function Mc(e,t){if(!e)return t;if(!t)return e;const n=X(Object.create(null),e);for(const s in t)n[s]=ee(e[s],t[s]);return n}function $c(e,t,n,s=!1){const r={},i={};Xt(i,un,1),e.propsDefaults=Object.create(null),fi(e,t,r,i);for(const o in e.propsOptions[0])o in r||(r[o]=void 0);n?e.props=s?r:ec(r):e.type.props?e.props=r:e.props=i,e.attrs=i}function Dc(e,t,n,s){const{props:r,attrs:i,vnode:{patchFlag:o}}=e,a=M(r),[f]=e.propsOptions;let u=!1;if((s||o>0)&&!(o&16)){if(o&8){const g=e.vnode.dynamicProps;for(let I=0;I<g.length;I++){let w=g[I];const A=t[w];if(f)if(P(i,w))A!==i[w]&&(i[w]=A,u=!0);else{const D=lt(w);r[D]=hs(f,a,D,A,e,!1)}else A!==i[w]&&(i[w]=A,u=!0)}}}else{fi(e,t,r,i)&&(u=!0);let g;for(const I in a)(!t||!P(t,I)&&((g=ct(I))===I||!P(t,g)))&&(f?n&&(n[I]!==void 0||n[g]!==void 0)&&(r[I]=hs(f,a,I,void 0,e,!0)):delete r[I]);if(i!==a)for(const I in i)(!t||!P(t,I))&&(delete i[I],u=!0)}u&&Te(e,"set","$attrs")}function fi(e,t,n,s){const[r,i]=e.propsOptions;let o=!1,a;if(t)for(let f in t){if(Jt(f))continue;const u=t[f];let g;r&&P(r,g=lt(f))?!i||!i.includes(g)?n[g]=u:(a||(a={}))[g]=u:rs(e.emitsOptions,f)||(!(f in s)||u!==s[f])&&(s[f]=u,o=!0)}if(i){const f=M(n),u=a||k;for(let g=0;g<i.length;g++){const I=i[g];n[I]=hs(r,f,I,u[I],e,!P(u,I))}}return o}function hs(e,t,n,s,r,i){const o=e[n];if(o!=null){const a=P(o,"default");if(a&&s===void 0){const f=o.default;if(o.type!==Function&&F(f)){const{propsDefaults:u}=r;n in u?s=u[n]:(pt(r),s=u[n]=f.call(null,t),Qe())}else s=f}o[0]&&(i&&!a?s=!1:o[1]&&(s===""||s===ct(n))&&(s=!0))}return s}function ui(e,t,n=!1){const s=t.propsCache,r=s.get(e);if(r)return r;const i=e.props,o={},a=[];let f=!1;if(!F(e)){const g=I=>{f=!0;const[w,A]=ui(I,t,!0);X(o,w),A&&a.push(...A)};!n&&t.mixins.length&&t.mixins.forEach(g),e.extends&&g(e.extends),e.mixins&&e.mixins.forEach(g)}if(!i&&!f)return s.set(e,ot),ot;if(O(i))for(let g=0;g<i.length;g++){const I=lt(i[g]);di(I)&&(o[I]=k)}else if(i)for(const g in i){const I=lt(g);if(di(I)){const w=i[g],A=o[I]=O(w)||F(w)?{type:w}:w;if(A){const D=gi(Boolean,A.type),N=gi(String,A.type);A[0]=D>-1,A[1]=N<0||D<N,(D>-1||P(A,"default"))&&a.push(I)}}}const u=[o,a];return s.set(e,u),u}function di(e){return e[0]!=="$"}function hi(e){const t=e&&e.toString().match(/^\s*function (\w+)/);return t?t[1]:e===null?"null":""}function pi(e,t){return hi(e)===hi(t)}function gi(e,t){return O(t)?t.findIndex(n=>pi(n,e)):F(t)&&pi(t,e)?0:-1}const mi=e=>e[0]==="_"||e==="$stable",ps=e=>O(e)?e.map(we):[we(e)],Nc=(e,t,n)=>{const s=lc((...r)=>ps(t(...r)),n);return s._c=!1,s},bi=(e,t,n)=>{const s=e._ctx;for(const r in e){if(mi(r))continue;const i=e[r];if(F(i))t[r]=Nc(r,i,s);else if(i!=null){const o=ps(i);t[r]=()=>o}}},_i=(e,t)=>{const n=ps(t);e.slots.default=()=>n},Lc=(e,t)=>{if(e.vnode.shapeFlag&32){const n=t._;n?(e.slots=M(t),Xt(t,"_",n)):bi(t,e.slots={})}else e.slots={},t&&_i(e,t);Xt(e.slots,un,1)},jc=(e,t,n)=>{const{vnode:s,slots:r}=e;let i=!0,o=k;if(s.shapeFlag&32){const a=t._;a?n&&a===1?i=!1:(X(r,t),!n&&a===1&&delete r._):(i=!t.$stable,bi(t,r)),o=t}else t&&(_i(e,t),o={default:1});if(i)for(const a in r)!mi(a)&&!(a in o)&&delete r[a]};function Ye(e,t,n,s){const r=e.dirs,i=t&&t.dirs;for(let o=0;o<r.length;o++){const a=r[o];i&&(a.oldValue=i[o].value);let f=a.dir[s];f&&(ut(),de(f,n,8,[e.el,a,e,t]),Ve())}}function yi(){return{app:null,config:{isNativeTag:_l,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let kc=0;function Bc(e,t){return function(s,r=null){r!=null&&!J(r)&&(r=null);const i=yi(),o=new Set;let a=!1;const f=i.app={_uid:kc++,_component:s,_props:r,_container:null,_context:i,_instance:null,version:bf,get config(){return i.config},set config(u){},use(u,...g){return o.has(u)||(u&&F(u.install)?(o.add(u),u.install(f,...g)):F(u)&&(o.add(u),u(f,...g))),f},mixin(u){return i.mixins.includes(u)||i.mixins.push(u),f},component(u,g){return g?(i.components[u]=g,f):i.components[u]},directive(u,g){return g?(i.directives[u]=g,f):i.directives[u]},mount(u,g,I){if(!a){const w=Ze(s,r);return w.appContext=i,g&&t?t(w,u):e(w,u,I),a=!0,f._container=u,u.__vue_app__=f,Is(w.component)||w.component.proxy}},unmount(){a&&(e(null,f._container),delete f._container.__vue_app__)},provide(u,g){return i.provides[u]=g,f}};return f}}function gs(e,t,n,s,r=!1){if(O(e)){e.forEach((w,A)=>gs(w,t&&(O(t)?t[A]:t),n,s,r));return}if(fs(s)&&!r)return;const i=s.shapeFlag&4?Is(s.component)||s.component.proxy:s.el,o=r?null:i,{i:a,r:f}=e,u=t&&t.r,g=a.refs===k?a.refs={}:a.refs,I=a.setupState;if(u!=null&&u!==f&&(Z(u)?(g[u]=null,P(I,u)&&(I[u]=null)):Q(u)&&(u.value=null)),F(f))$e(f,a,12,[o,g]);else{const w=Z(f),A=Q(f);if(w||A){const D=()=>{if(e.f){const N=w?g[f]:f.value;r?O(N)&&kn(N,i):O(N)?N.includes(i)||N.push(i):w?g[f]=[i]:(f.value=[i],e.k&&(g[e.k]=f.value))}else w?(g[f]=o,P(I,f)&&(I[f]=o)):Q(f)&&(f.value=o,e.k&&(g[e.k]=o))};o?(D.id=-1,ne(D,n)):D()}}}const ne=pc;function Hc(e){return Uc(e)}function Uc(e,t){const n=Tl();n.__VUE__=!0;const{insert:s,remove:r,patchProp:i,createElement:o,createText:a,createComment:f,setText:u,setElementText:g,parentNode:I,nextSibling:w,setScopeId:A=me,cloneNode:D,insertStaticContent:N}=e,R=(l,c,d,p=null,h=null,_=null,E=!1,b=null,y=!!c.dynamicChildren)=>{if(l===c)return;l&&!Xe(l,c)&&(p=$t(l),Oe(l,h,_,!0),l=null),c.patchFlag===-2&&(y=!1,c.dynamicChildren=null);const{type:m,ref:C,shapeFlag:v}=c;switch(m){case ms:$(l,c,d,p);break;case Pe:ce(l,c,d,p);break;case bs:l==null&&W(c,d,p,E);break;case Ie:et(l,c,d,p,h,_,E,b,y);break;default:v&1?Ne(l,c,d,p,h,_,E,b,y):v&6?Rs(l,c,d,p,h,_,E,b,y):(v&64||v&128)&&m.process(l,c,d,p,h,_,E,b,y,nt)}C!=null&&h&&gs(C,l&&l.ref,_,c||l,!c)},$=(l,c,d,p)=>{if(l==null)s(c.el=a(c.children),d,p);else{const h=c.el=l.el;c.children!==l.children&&u(h,c.children)}},ce=(l,c,d,p)=>{l==null?s(c.el=f(c.children||""),d,p):c.el=l.el},W=(l,c,d,p)=>{[l.el,l.anchor]=N(l.children,c,d,p)},q=({el:l,anchor:c},d,p)=>{let h;for(;l&&l!==c;)h=w(l),s(l,d,p),l=h;s(c,d,p)},se=({el:l,anchor:c})=>{let d;for(;l&&l!==c;)d=w(l),r(l),l=d;r(c)},Ne=(l,c,d,p,h,_,E,b,y)=>{E=E||c.type==="svg",l==null?L(c,d,p,h,_,E,b,y):he(l,c,h,_,E,b,y)},L=(l,c,d,p,h,_,E,b)=>{let y,m;const{type:C,props:v,shapeFlag:T,transition:x,patchFlag:S,dirs:z}=l;if(l.el&&D!==void 0&&S===-1)y=l.el=D(l.el);else{if(y=l.el=o(l.type,_,v&&v.is,v),T&8?g(y,l.children):T&16&&V(l.children,y,null,p,h,_&&C!=="foreignObject",E,b),z&&Ye(l,null,p,"created"),v){for(const H in v)H!=="value"&&!Jt(H)&&i(y,H,null,v[H],_,l.children,p,h,Ce);"value"in v&&i(y,"value",null,v.value),(m=v.onVnodeBeforeMount)&&Ee(m,p,l)}Y(y,l,l.scopeId,E,p)}z&&Ye(l,null,p,"beforeMount");const j=(!h||h&&!h.pendingBranch)&&x&&!x.persisted;j&&x.beforeEnter(y),s(y,c,d),((m=v&&v.onVnodeMounted)||j||z)&&ne(()=>{m&&Ee(m,p,l),j&&x.enter(y),z&&Ye(l,null,p,"mounted")},h)},Y=(l,c,d,p,h)=>{if(d&&A(l,d),p)for(let _=0;_<p.length;_++)A(l,p[_]);if(h){let _=h.subTree;if(c===_){const E=h.vnode;Y(l,E,E.scopeId,E.slotScopeIds,h.parent)}}},V=(l,c,d,p,h,_,E,b,y=0)=>{for(let m=y;m<l.length;m++){const C=l[m]=b?Me(l[m]):we(l[m]);R(null,C,c,d,p,h,_,E,b)}},he=(l,c,d,p,h,_,E)=>{const b=c.el=l.el;let{patchFlag:y,dynamicChildren:m,dirs:C}=c;y|=l.patchFlag&16;const v=l.props||k,T=c.props||k;let x;d&&Je(d,!1),(x=T.onVnodeBeforeUpdate)&&Ee(x,d,c,l),C&&Ye(c,l,d,"beforeUpdate"),d&&Je(d,!0);const S=h&&c.type!=="foreignObject";if(m?re(l.dynamicChildren,m,b,d,p,S,_):E||ve(l,c,b,null,d,p,S,_,!1),y>0){if(y&16)pe(b,c,v,T,d,p,h);else if(y&2&&v.class!==T.class&&i(b,"class",null,T.class,h),y&4&&i(b,"style",v.style,T.style,h),y&8){const z=c.dynamicProps;for(let j=0;j<z.length;j++){const H=z[j],ge=v[H],st=T[H];(st!==ge||H==="value")&&i(b,H,ge,st,h,l.children,d,p,Ce)}}y&1&&l.children!==c.children&&g(b,c.children)}else!E&&m==null&&pe(b,c,v,T,d,p,h);((x=T.onVnodeUpdated)||C)&&ne(()=>{x&&Ee(x,d,c,l),C&&Ye(c,l,d,"updated")},p)},re=(l,c,d,p,h,_,E)=>{for(let b=0;b<c.length;b++){const y=l[b],m=c[b],C=y.el&&(y.type===Ie||!Xe(y,m)||y.shapeFlag&(6|64))?I(y.el):d;R(y,m,C,null,p,h,_,E,!0)}},pe=(l,c,d,p,h,_,E)=>{if(d!==p){for(const b in p){if(Jt(b))continue;const y=p[b],m=d[b];y!==m&&b!=="value"&&i(l,b,m,y,E,c.children,h,_,Ce)}if(d!==k)for(const b in d)!Jt(b)&&!(b in p)&&i(l,b,d[b],null,E,c.children,h,_,Ce);"value"in p&&i(l,"value",d.value,p.value)}},et=(l,c,d,p,h,_,E,b,y)=>{const m=c.el=l?l.el:a(""),C=c.anchor=l?l.anchor:a("");let{patchFlag:v,dynamicChildren:T,slotScopeIds:x}=c;x&&(b=b?b.concat(x):x),l==null?(s(m,d,p),s(C,d,p),V(c.children,d,C,h,_,E,b,y)):v>0&&v&64&&T&&l.dynamicChildren?(re(l.dynamicChildren,T,d,h,_,E,b),(c.key!=null||h&&c===h.subTree)&&Ii(l,c,!0)):ve(l,c,d,C,h,_,E,b,y)},Rs=(l,c,d,p,h,_,E,b,y)=>{c.slotScopeIds=b,l==null?c.shapeFlag&512?h.ctx.activate(c,d,p,E,y):_n(c,d,p,h,_,E,y):te(l,c,y)},_n=(l,c,d,p,h,_,E)=>{const b=l.component=nf(l,p,h);if(an(l)&&(b.ctx.renderer=nt),rf(b),b.asyncDep){if(h&&h.registerDep(b,K),!l.el){const y=b.subTree=Ze(Pe);ce(null,y,c,d)}return}K(b,l,c,d,h,_,E)},te=(l,c,d)=>{const p=c.component=l.component;if(uc(l,c,d))if(p.asyncDep&&!p.asyncResolved){B(p,c,d);return}else p.next=c,hf(p.update),p.update();else c.component=l.component,c.el=l.el,p.vnode=c},K=(l,c,d,p,h,_,E)=>{const b=()=>{if(l.isMounted){let{next:C,bu:v,u:T,parent:x,vnode:S}=l,z=C,j;Je(l,!1),C?(C.el=S.el,B(l,C,E)):C=S,v&&zn(v),(j=C.props&&C.props.onVnodeBeforeUpdate)&&Ee(j,x,C,S),Je(l,!0);const H=is(l),ge=l.subTree;l.subTree=H,R(ge,H,I(ge.el),$t(ge),l,h,_),C.el=H.el,z===null&&dc(l,H.el),T&&ne(T,h),(j=C.props&&C.props.onVnodeUpdated)&&ne(()=>Ee(j,x,C,S),h)}else{let C;const{el:v,props:T}=c,{bm:x,m:S,parent:z}=l,j=fs(c);if(Je(l,!1),x&&zn(x),!j&&(C=T&&T.onVnodeBeforeMount)&&Ee(C,z,c),Je(l,!0),v&&wn){const H=()=>{l.subTree=is(l),wn(v,l.subTree,l,h,null)};j?c.type.__asyncLoader().then(()=>!l.isUnmounted&&H()):H()}else{const H=l.subTree=is(l);R(null,H,d,p,l,h,_),c.el=H.el}if(S&&ne(S,h),!j&&(C=T&&T.onVnodeMounted)){const H=c;ne(()=>Ee(C,z,H),h)}c.shapeFlag&256&&l.a&&ne(l.a,h),l.isMounted=!0,c=d=p=null}},y=l.effect=new Yn(b,()=>Ri(l.update),l.scope),m=l.update=y.run.bind(y);m.id=l.uid,Je(l,!0),m()},B=(l,c,d)=>{c.component=l;const p=l.vnode.props;l.vnode=c,l.next=null,Dc(l,c.props,p,d),jc(l,c.children,d),ut(),Cs(void 0,l.update),Ve()},ve=(l,c,d,p,h,_,E,b,y=!1)=>{const m=l&&l.children,C=l?l.shapeFlag:0,v=c.children,{patchFlag:T,shapeFlag:x}=c;if(T>0){if(T&128){yt(m,v,d,p,h,_,E,b,y);return}else if(T&256){yn(m,v,d,p,h,_,E,b,y);return}}x&8?(C&16&&Ce(m,h,_),v!==m&&g(d,v)):C&16?x&16?yt(m,v,d,p,h,_,E,b,y):Ce(m,h,_,!0):(C&8&&g(d,""),x&16&&V(v,d,p,h,_,E,b,y))},yn=(l,c,d,p,h,_,E,b,y)=>{l=l||ot,c=c||ot;const m=l.length,C=c.length,v=Math.min(m,C);let T;for(T=0;T<v;T++){const x=c[T]=y?Me(c[T]):we(c[T]);R(l[T],x,d,null,h,_,E,b,y)}m>C?Ce(l,h,_,!0,!1,v):V(c,d,p,h,_,E,b,y,v)},yt=(l,c,d,p,h,_,E,b,y)=>{let m=0;const C=c.length;let v=l.length-1,T=C-1;for(;m<=v&&m<=T;){const x=l[m],S=c[m]=y?Me(c[m]):we(c[m]);if(Xe(x,S))R(x,S,d,null,h,_,E,b,y);else break;m++}for(;m<=v&&m<=T;){const x=l[v],S=c[T]=y?Me(c[T]):we(c[T]);if(Xe(x,S))R(x,S,d,null,h,_,E,b,y);else break;v--,T--}if(m>v){if(m<=T){const x=T+1,S=x<C?c[x].el:p;for(;m<=T;)R(null,c[m]=y?Me(c[m]):we(c[m]),d,S,h,_,E,b,y),m++}}else if(m>T)for(;m<=v;)Oe(l[m],h,_,!0),m++;else{const x=m,S=m,z=new Map;for(m=S;m<=T;m++){const ie=c[m]=y?Me(c[m]):we(c[m]);ie.key!=null&&z.set(ie.key,m)}let j,H=0;const ge=T-S+1;let st=!1,Ps=0;const It=new Array(ge);for(m=0;m<ge;m++)It[m]=0;for(m=x;m<=v;m++){const ie=l[m];if(H>=ge){Oe(ie,h,_,!0);continue}let be;if(ie.key!=null)be=z.get(ie.key);else for(j=S;j<=T;j++)if(It[j-S]===0&&Xe(ie,c[j])){be=j;break}be===void 0?Oe(ie,h,_,!0):(It[be-S]=m+1,be>=Ps?Ps=be:st=!0,R(ie,c[be],d,null,h,_,E,b,y),H++)}const Ms=st?zc(It):ot;for(j=Ms.length-1,m=ge-1;m>=0;m--){const ie=S+m,be=c[ie],$s=ie+1<C?c[ie+1].el:p;It[m]===0?R(null,be,d,$s,h,_,E,b,y):st&&(j<0||m!==Ms[j]?tt(be,d,$s,2):j--)}}},tt=(l,c,d,p,h=null)=>{const{el:_,type:E,transition:b,children:y,shapeFlag:m}=l;if(m&6){tt(l.component.subTree,c,d,p);return}if(m&128){l.suspense.move(c,d,p);return}if(m&64){E.move(l,c,d,nt);return}if(E===Ie){s(_,c,d);for(let v=0;v<y.length;v++)tt(y[v],c,d,p);s(l.anchor,c,d);return}if(E===bs){q(l,c,d);return}if(p!==2&&m&1&&b)if(p===0)b.beforeEnter(_),s(_,c,d),ne(()=>b.enter(_),h);else{const{leave:v,delayLeave:T,afterLeave:x}=b,S=()=>s(_,c,d),z=()=>{v(_,()=>{S(),x&&x()})};T?T(_,S,z):z()}else s(_,c,d)},Oe=(l,c,d,p=!1,h=!1)=>{const{type:_,props:E,ref:b,children:y,dynamicChildren:m,shapeFlag:C,patchFlag:v,dirs:T}=l;if(b!=null&&gs(b,null,d,l,!0),C&256){c.ctx.deactivate(l);return}const x=C&1&&T,S=!fs(l);let z;if(S&&(z=E&&E.onVnodeBeforeUnmount)&&Ee(z,c,l),C&6)Vi(l.component,d,p);else{if(C&128){l.suspense.unmount(d,p);return}x&&Ye(l,null,c,"beforeUnmount"),C&64?l.type.remove(l,c,d,h,nt,p):m&&(_!==Ie||v>0&&v&64)?Ce(m,c,d,!1,!0):(_===Ie&&v&(128|256)||!h&&C&16)&&Ce(y,c,d),p&&Fs(l)}(S&&(z=E&&E.onVnodeUnmounted)||x)&&ne(()=>{z&&Ee(z,c,l),x&&Ye(l,null,c,"unmounted")},d)},Fs=l=>{const{type:c,el:d,anchor:p,transition:h}=l;if(c===Ie){qi(d,p);return}if(c===bs){se(l);return}const _=()=>{r(d),h&&!h.persisted&&h.afterLeave&&h.afterLeave()};if(l.shapeFlag&1&&h&&!h.persisted){const{leave:E,delayLeave:b}=h,y=()=>E(d,_);b?b(l.el,_,y):y()}else _()},qi=(l,c)=>{let d;for(;l!==c;)d=w(l),r(l),l=d;r(c)},Vi=(l,c,d)=>{const{bum:p,scope:h,update:_,subTree:E,um:b}=l;p&&zn(p),h.stop(),_&&(_.active=!1,Oe(E,l,c,d)),b&&ne(b,c),ne(()=>{l.isUnmounted=!0},c),c&&c.pendingBranch&&!c.isUnmounted&&l.asyncDep&&!l.asyncResolved&&l.suspenseId===c.pendingId&&(c.deps--,c.deps===0&&c.resolve())},Ce=(l,c,d,p=!1,h=!1,_=0)=>{for(let E=_;E<l.length;E++)Oe(l[E],c,d,p,h)},$t=l=>l.shapeFlag&6?$t(l.component.subTree):l.shapeFlag&128?l.suspense.next():w(l.anchor||l.el),Ss=(l,c,d)=>{l==null?c._vnode&&Oe(c._vnode,null,null,!0):R(c._vnode||null,l,c,null,null,null,d),Pi(),c._vnode=l},nt={p:R,um:Oe,m:tt,r:Fs,mt:_n,mc:V,pc:ve,pbc:re,n:$t,o:e};let In,wn;return t&&([In,wn]=t(nt)),{render:Ss,hydrate:In,createApp:Bc(Ss,In)}}function Je({effect:e,update:t},n){e.allowRecurse=t.allowRecurse=n}function Ii(e,t,n=!1){const s=e.children,r=t.children;if(O(s)&&O(r))for(let i=0;i<s.length;i++){const o=s[i];let a=r[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=r[i]=Me(r[i]),a.el=o.el),n||Ii(o,a))}}function zc(e){const t=e.slice(),n=[0];let s,r,i,o,a;const f=e.length;for(s=0;s<f;s++){const u=e[s];if(u!==0){if(r=n[n.length-1],e[r]<u){t[s]=r,n.push(s);continue}for(i=0,o=n.length-1;i<o;)a=i+o>>1,e[n[a]]<u?i=a+1:o=a;u<e[n[i]]&&(i>0&&(t[s]=n[i-1]),n[i]=s)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=t[o];return n}const Kc=e=>e.__isTeleport,qc=Symbol(),Ie=Symbol(void 0),ms=Symbol(void 0),Pe=Symbol(void 0),bs=Symbol(void 0),Rt=[];let Ge=null;function Kf(e=!1){Rt.push(Ge=e?null:[])}function Vc(){Rt.pop(),Ge=Rt[Rt.length-1]||null}let fn=1;function wi(e){fn+=e}function Wc(e){return e.dynamicChildren=fn>0?Ge||ot:null,Vc(),fn>0&&Ge&&Ge.push(e),e}function qf(e,t,n,s,r,i){return Wc(vi(e,t,n,s,r,i,!0))}function Yc(e){return e?e.__v_isVNode===!0:!1}function Xe(e,t){return e.type===t.type&&e.key===t.key}const un="__vInternal",Ei=({key:e})=>e!=null?e:null,dn=({ref:e,ref_key:t,ref_for:n})=>e!=null?Z(e)||Q(e)||F(e)?{i:ye,r:e,k:t,f:!!n}:e:null;function vi(e,t=null,n=null,s=0,r=null,i=e===Ie?0:1,o=!1,a=!1){const f={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&Ei(t),ref:t&&dn(t),scopeId:Xr,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:s,dynamicProps:r,dynamicChildren:null,appContext:null};return a?(_s(f,n),i&128&&e.normalize(f)):n&&(f.shapeFlag|=Z(n)?8:16),fn>0&&!o&&Ge&&(f.patchFlag>0||i&6)&&f.patchFlag!==32&&Ge.push(f),f}const Ze=Jc;function Jc(e,t=null,n=null,s=0,r=null,i=!1){if((!e||e===qc)&&(e=Pe),Yc(e)){const a=ht(e,t,!0);return n&&_s(a,n),a}if(cf(e)&&(e=e.__vccOpts),t){t=Gc(t);let{class:a,style:f}=t;a&&!Z(a)&&(t.class=Ln(a)),J(f)&&(qr(f)&&!O(f)&&(f=X({},f)),t.style=Nn(f))}const o=Z(e)?1:hc(e)?128:Kc(e)?64:J(e)?4:F(e)?2:0;return vi(e,t,n,s,r,o,i,!0)}function Gc(e){return e?qr(e)||un in e?X({},e):e:null}function ht(e,t,n=!1){const{props:s,ref:r,patchFlag:i,children:o}=e,a=t?Zc(s||{},t):s;return{__v_isVNode:!0,__v_skip:!0,type:e.type,props:a,key:a&&Ei(a),ref:t&&t.ref?n&&r?O(r)?r.concat(dn(t)):[r,dn(t)]:dn(t):r,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:o,target:e.target,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==Ie?i===-1?16:i|16:i,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:e.transition,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&ht(e.ssContent),ssFallback:e.ssFallback&&ht(e.ssFallback),el:e.el,anchor:e.anchor}}function Xc(e=" ",t=0){return Ze(ms,null,e,t)}function we(e){return e==null||typeof e=="boolean"?Ze(Pe):O(e)?Ze(Ie,null,e.slice()):typeof e=="object"?Me(e):Ze(ms,null,String(e))}function Me(e){return e.el===null||e.memo?e:ht(e)}function _s(e,t){let n=0;const{shapeFlag:s}=e;if(t==null)t=null;else if(O(t))n=16;else if(typeof t=="object")if(s&(1|64)){const r=t.default;r&&(r._c&&(r._d=!1),_s(e,r()),r._c&&(r._d=!0));return}else{n=32;const r=t._;!r&&!(un in t)?t._ctx=ye:r===3&&ye&&(ye.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else F(t)?(t={default:t,_ctx:ye},n=32):(t=String(t),s&64?(n=16,t=[Xc(t)]):n=8);e.children=t,e.shapeFlag|=n}function Zc(...e){const t={};for(let n=0;n<e.length;n++){const s=e[n];for(const r in s)if(r==="class")t.class!==s.class&&(t.class=Ln([t.class,s.class]));else if(r==="style")t.style=Nn([t.style,s.style]);else if(Wt(r)){const i=t[r],o=s[r];i!==o&&!(O(i)&&i.includes(o))&&(t[r]=i?[].concat(i,o):o)}else r!==""&&(t[r]=s[r])}return t}function Ee(e,t,n,s=null){de(e,t,7,[n,s])}const ys=e=>e?Ci(e)?Is(e)||e.proxy:ys(e.parent):null,hn=X(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>ys(e.parent),$root:e=>ys(e.root),$emit:e=>e.emit,$options:e=>li(e),$forceUpdate:e=>()=>Ri(e.update),$nextTick:e=>uf.bind(e.proxy),$watch:e=>mf.bind(e)}),Qc={get({_:e},t){const{ctx:n,setupState:s,data:r,props:i,accessCache:o,type:a,appContext:f}=e;let u;if(t[0]!=="$"){const A=o[t];if(A!==void 0)switch(A){case 1:return s[t];case 2:return r[t];case 4:return n[t];case 3:return i[t]}else{if(s!==k&&P(s,t))return o[t]=1,s[t];if(r!==k&&P(r,t))return o[t]=2,r[t];if((u=e.propsOptions[0])&&P(u,t))return o[t]=3,i[t];if(n!==k&&P(n,t))return o[t]=4,n[t];us&&(o[t]=0)}}const g=hn[t];let I,w;if(g)return t==="$attrs"&&ae(e,"get",t),g(e);if((I=a.__cssModules)&&(I=I[t]))return I;if(n!==k&&P(n,t))return o[t]=4,n[t];if(w=f.config.globalProperties,P(w,t))return w[t]},set({_:e},t,n){const{data:s,setupState:r,ctx:i}=e;if(r!==k&&P(r,t))r[t]=n;else if(s!==k&&P(s,t))s[t]=n;else if(P(e.props,t))return!1;return t[0]==="$"&&t.slice(1)in e?!1:(i[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:s,appContext:r,propsOptions:i}},o){let a;return!!n[o]||e!==k&&P(e,o)||t!==k&&P(t,o)||(a=i[0])&&P(a,o)||P(s,o)||P(hn,o)||P(r.config.globalProperties,o)}},ef=yi();let tf=0;function nf(e,t,n){const s=e.type,r=(t?t.appContext:e.appContext)||ef,i={uid:tf++,vnode:e,type:s,parent:t,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,scope:new Al(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(r.provides),accessCache:null,renderCache:[],components:null,directives:null,propsOptions:ui(s,r),emitsOptions:Gr(s,r),emit:null,emitted:null,propsDefaults:k,inheritAttrs:s.inheritAttrs,ctx:k,data:k,props:k,attrs:k,slots:k,refs:k,setupState:k,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=t?t.root:i,i.emit=ac.bind(null,i),e.ce&&e.ce(i),i}let G=null;const sf=()=>G||ye,pt=e=>{G=e,e.scope.on()},Qe=()=>{G&&G.scope.off(),G=null};function Ci(e){return e.vnode.shapeFlag&4}let pn=!1;function rf(e,t=!1){pn=t;const{props:n,children:s}=e.vnode,r=Ci(e);$c(e,n,r,t),Lc(e,s);const i=r?of(e,t):void 0;return pn=!1,i}function of(e,t){const n=e.type;e.accessCache=Object.create(null),e.proxy=Vr(new Proxy(e.ctx,Qc));const{setup:s}=n;if(s){const r=e.setupContext=s.length>1?lf(e):null;pt(e),ut();const i=$e(s,e,0,[e.props,r]);if(Ve(),Qe(),vr(i)){if(i.then(Qe,Qe),t)return i.then(o=>{Ti(e,o,t)}).catch(o=>{gn(o,e,0)});e.asyncDep=i}else Ti(e,i,t)}else xi(e,t)}function Ti(e,t,n){F(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:J(t)&&(e.setupState=Jr(t)),xi(e,n)}let Ai;function xi(e,t,n){const s=e.type;if(!e.render){if(!t&&Ai&&!s.render){const r=s.template;if(r){const{isCustomElement:i,compilerOptions:o}=e.appContext.config,{delimiters:a,compilerOptions:f}=s,u=X(X({isCustomElement:i,delimiters:a},o),f);s.render=Ai(r,u)}}e.render=s.render||me}pt(e),ut(),Rc(e),Ve(),Qe()}function af(e){return new Proxy(e.attrs,{get(t,n){return ae(e,"get","$attrs"),t[n]}})}function lf(e){const t=s=>{e.exposed=s||{}};let n;return{get attrs(){return n||(n=af(e))},slots:e.slots,emit:e.emit,expose:t}}function Is(e){if(e.exposed)return e.exposeProxy||(e.exposeProxy=new Proxy(Jr(Vr(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in hn)return hn[n](e)}}))}function cf(e){return F(e)&&"__vccOpts"in e}function $e(e,t,n,s){let r;try{r=s?e(...s):e()}catch(i){gn(i,t,n)}return r}function de(e,t,n,s){if(F(e)){const i=$e(e,t,n,s);return i&&vr(i)&&i.catch(o=>{gn(o,t,n)}),i}const r=[];for(let i=0;i<e.length;i++)r.push(de(e[i],t,n,s));return r}function gn(e,t,n,s=!0){const r=t?t.vnode:null;if(t){let i=t.parent;const o=t.proxy,a=n;for(;i;){const u=i.ec;if(u){for(let g=0;g<u.length;g++)if(u[g](e,o,a)===!1)return}i=i.parent}const f=t.appContext.config.errorHandler;if(f){$e(f,null,10,[e,o,a]);return}}ff(e,n,r,s)}function ff(e,t,n,s=!0){console.error(e)}let mn=!1,ws=!1;const le=[];let xe=0;const Ft=[];let St=null,gt=0;const Pt=[];let De=null,mt=0;const Oi=Promise.resolve();let Es=null,vs=null;function uf(e){const t=Es||Oi;return e?t.then(this?e.bind(this):e):t}function df(e){let t=xe+1,n=le.length;for(;t<n;){const s=t+n>>>1;Mt(le[s])<e?t=s+1:n=s}return t}function Ri(e){(!le.length||!le.includes(e,mn&&e.allowRecurse?xe+1:xe))&&e!==vs&&(e.id==null?le.push(e):le.splice(df(e.id),0,e),Fi())}function Fi(){!mn&&!ws&&(ws=!0,Es=Oi.then(Mi))}function hf(e){const t=le.indexOf(e);t>xe&&le.splice(t,1)}function Si(e,t,n,s){O(e)?n.push(...e):(!t||!t.includes(e,e.allowRecurse?s+1:s))&&n.push(e),Fi()}function pf(e){Si(e,St,Ft,gt)}function gf(e){Si(e,De,Pt,mt)}function Cs(e,t=null){if(Ft.length){for(vs=t,St=[...new Set(Ft)],Ft.length=0,gt=0;gt<St.length;gt++)St[gt]();St=null,gt=0,vs=null,Cs(e,t)}}function Pi(e){if(Pt.length){const t=[...new Set(Pt)];if(Pt.length=0,De){De.push(...t);return}for(De=t,De.sort((n,s)=>Mt(n)-Mt(s)),mt=0;mt<De.length;mt++)De[mt]();De=null,mt=0}}const Mt=e=>e.id==null?1/0:e.id;function Mi(e){ws=!1,mn=!0,Cs(e),le.sort((n,s)=>Mt(n)-Mt(s));const t=me;try{for(xe=0;xe<le.length;xe++){const n=le[xe];n&&n.active!==!1&&$e(n,null,14)}}finally{xe=0,le.length=0,Pi(),mn=!1,Es=null,(le.length||Ft.length||Pt.length)&&Mi(e)}}const $i={};function Ts(e,t,n){return Di(e,t,n)}function Di(e,t,{immediate:n,deep:s,flush:r,onTrack:i,onTrigger:o}=k){const a=G;let f,u=!1,g=!1;if(Q(e)?(f=()=>e.value,u=!!e._shallow):dt(e)?(f=()=>e,s=!0):O(e)?(g=!0,u=e.some(dt),f=()=>e.map($=>{if(Q($))return $.value;if(dt($))return bt($);if(F($))return $e($,a,2)})):F(e)?t?f=()=>$e(e,a,2):f=()=>{if(!(a&&a.isUnmounted))return I&&I(),de(e,a,3,[w])}:f=me,t&&s){const $=f;f=()=>bt($())}let I,w=$=>{I=R.onStop=()=>{$e($,a,4)}};if(pn)return w=me,t?n&&de(t,a,3,[f(),g?[]:void 0,w]):f(),me;let A=g?[]:$i;const D=()=>{if(!!R.active)if(t){const $=R.run();(s||u||(g?$.some((ce,W)=>Tt(ce,A[W])):Tt($,A)))&&(I&&I(),de(t,a,3,[$,A===$i?void 0:A,w]),A=$)}else R.run()};D.allowRecurse=!!t;let N;r==="sync"?N=D:r==="post"?N=()=>ne(D,a&&a.suspense):N=()=>{!a||a.isMounted?pf(D):D()};const R=new Yn(f,N);return t?n?D():A=R.run():r==="post"?ne(R.run.bind(R),a&&a.suspense):R.run(),()=>{R.stop(),a&&a.scope&&kn(a.scope.effects,R)}}function mf(e,t,n){const s=this.proxy,r=Z(e)?e.includes(".")?Ni(s,e):()=>s[e]:e.bind(s,s);let i;F(t)?i=t:(i=t.handler,n=t);const o=G;pt(this);const a=Di(r,i.bind(s),n);return o?pt(o):Qe(),a}function Ni(e,t){const n=t.split(".");return()=>{let s=e;for(let r=0;r<n.length&&s;r++)s=s[n[r]];return s}}function bt(e,t){if(!J(e)||e.__v_skip||(t=t||new Set,t.has(e)))return e;if(t.add(e),Q(e))bt(e.value,t);else if(O(e))for(let n=0;n<e.length;n++)bt(e[n],t);else if(Er(e)||at(e))e.forEach(n=>{bt(n,t)});else if(Tr(e))for(const n in e)bt(e[n],t);return e}const bf="3.2.26",_f="http://www.w3.org/2000/svg",_t=typeof document!="undefined"?document:null,Li=new Map,yf={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,s)=>{const r=t?_t.createElementNS(_f,e):_t.createElement(e,n?{is:n}:void 0);return e==="select"&&s&&s.multiple!=null&&r.setAttribute("multiple",s.multiple),r},createText:e=>_t.createTextNode(e),createComment:e=>_t.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>_t.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},cloneNode(e){const t=e.cloneNode(!0);return"_value"in e&&(t._value=e._value),t},insertStaticContent(e,t,n,s){const r=n?n.previousSibling:t.lastChild;let i=Li.get(e);if(!i){const o=_t.createElement("template");if(o.innerHTML=s?`<svg>${e}</svg>`:e,i=o.content,s){const a=i.firstChild;for(;a.firstChild;)i.appendChild(a.firstChild);i.removeChild(a)}Li.set(e,i)}return t.insertBefore(i.cloneNode(!0),n),[r?r.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}};function If(e,t,n){const s=e._vtc;s&&(t=(t?[t,...s]:[...s]).join(" ")),t==null?e.removeAttribute("class"):n?e.setAttribute("class",t):e.className=t}function wf(e,t,n){const s=e.style,r=Z(n);if(n&&!r){for(const i in n)As(s,i,n[i]);if(t&&!Z(t))for(const i in t)n[i]==null&&As(s,i,"")}else{const i=s.display;r?t!==n&&(s.cssText=n):t&&e.removeAttribute("style"),"_vod"in e&&(s.display=i)}}const ji=/\s*!important$/;function As(e,t,n){if(O(n))n.forEach(s=>As(e,t,s));else if(t.startsWith("--"))e.setProperty(t,n);else{const s=Ef(e,t);ji.test(n)?e.setProperty(ct(s),n.replace(ji,""),"important"):e[s]=n}}const ki=["Webkit","Moz","ms"],xs={};function Ef(e,t){const n=xs[t];if(n)return n;let s=lt(t);if(s!=="filter"&&s in e)return xs[t]=s;s=Ar(s);for(let r=0;r<ki.length;r++){const i=ki[r]+s;if(i in e)return xs[t]=i}return t}const Bi="http://www.w3.org/1999/xlink";function vf(e,t,n,s,r){if(s&&t.startsWith("xlink:"))n==null?e.removeAttributeNS(Bi,t.slice(6,t.length)):e.setAttributeNS(Bi,t,n);else{const i=pl(t);n==null||i&&!Ir(n)?e.removeAttribute(t):e.setAttribute(t,i?"":n)}}function Cf(e,t,n,s,r,i,o){if(t==="innerHTML"||t==="textContent"){s&&o(s,r,i),e[t]=n==null?"":n;return}if(t==="value"&&e.tagName!=="PROGRESS"&&!e.tagName.includes("-")){e._value=n;const a=n==null?"":n;(e.value!==a||e.tagName==="OPTION")&&(e.value=a),n==null&&e.removeAttribute(t);return}if(n===""||n==null){const a=typeof e[t];if(a==="boolean"){e[t]=Ir(n);return}else if(n==null&&a==="string"){e[t]="",e.removeAttribute(t);return}else if(a==="number"){try{e[t]=0}catch{}e.removeAttribute(t);return}}try{e[t]=n}catch{}}let bn=Date.now,Hi=!1;if(typeof window!="undefined"){bn()>document.createEvent("Event").timeStamp&&(bn=()=>performance.now());const e=navigator.userAgent.match(/firefox\/(\d+)/i);Hi=!!(e&&Number(e[1])<=53)}let Os=0;const Tf=Promise.resolve(),Af=()=>{Os=0},xf=()=>Os||(Tf.then(Af),Os=bn());function Of(e,t,n,s){e.addEventListener(t,n,s)}function Rf(e,t,n,s){e.removeEventListener(t,n,s)}function Ff(e,t,n,s,r=null){const i=e._vei||(e._vei={}),o=i[t];if(s&&o)o.value=s;else{const[a,f]=Sf(t);if(s){const u=i[t]=Pf(s,r);Of(e,a,u,f)}else o&&(Rf(e,a,o,f),i[t]=void 0)}}const Ui=/(?:Once|Passive|Capture)$/;function Sf(e){let t;if(Ui.test(e)){t={};let n;for(;n=e.match(Ui);)e=e.slice(0,e.length-n[0].length),t[n[0].toLowerCase()]=!0}return[ct(e.slice(2)),t]}function Pf(e,t){const n=s=>{const r=s.timeStamp||bn();(Hi||r>=n.attached-1)&&de(Mf(s,n.value),t,5,[s])};return n.value=e,n.attached=xf(),n}function Mf(e,t){if(O(t)){const n=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{n.call(e),e._stopped=!0},t.map(s=>r=>!r._stopped&&s(r))}else return t}const zi=/^on[a-z]/,$f=(e,t,n,s,r=!1,i,o,a,f)=>{t==="class"?If(e,s,r):t==="style"?wf(e,n,s):Wt(t)?jn(t)||Ff(e,t,n,s,o):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):Df(e,t,s,r))?Cf(e,t,s,i,o,a,f):(t==="true-value"?e._trueValue=s:t==="false-value"&&(e._falseValue=s),vf(e,t,s,r))};function Df(e,t,n,s){return s?!!(t==="innerHTML"||t==="textContent"||t in e&&zi.test(t)&&F(n)):t==="spellcheck"||t==="draggable"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA"||zi.test(t)&&Z(n)?!1:t in e}const Nf={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String};_c.props;const Lf=X({patchProp:$f},yf);let Ki;function jf(){return Ki||(Ki=Hc(Lf))}const Vf=(...e)=>{const t=jf().createApp(...e),{mount:n}=t;return t.mount=s=>{const r=kf(s);if(!r)return;const i=t._component;!F(i)&&!i.render&&!i.template&&(i.template=r.innerHTML),r.innerHTML="";const o=n(r,!1,r instanceof SVGElement);return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),o},t};function kf(e){return Z(e)?document.querySelector(e):e}export{Ie as F,Ze as a,vi as b,qf as c,Vf as d,Hf as g,Bf as i,Kf as o,zf as r,Uf as t};
