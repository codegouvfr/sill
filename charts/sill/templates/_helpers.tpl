{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "sill.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "sill.web.name" -}}
{{- printf "%s-%s" (include "sill.name" .) .Values.web.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "sill.api.name" -}}
{{- printf "%s-%s" (include "sill.name" .) .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "sill.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "sill.web.fullname" -}}
{{- printf "%s-%s" (include "sill.fullname" .) .Values.web.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "sill.api.fullname" -}}
{{- printf "%s-%s" (include "sill.fullname" .) .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "sill.chart" -}}
{{- printf "sill" -}}
{{- end -}}

{{- define "sill.api.chart" -}}
{{- printf "sill-api" -}}
{{- end -}}

{{- define "sill.web.chart" -}}
{{- printf "sill-web" -}}
{{- end -}}


{{/*Common labels*/}}

{{- define "sill.labels" -}}
helm.sh/chart: {{ include "sill.chart" . }}
{{ include "sill.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "sill.api.labels" -}}
helm.sh/chart: {{ include "sill.api.chart" . }}
{{ include "sill.api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "sill.web.labels" -}}
helm.sh/chart: {{ include "sill.web.chart" . }}
{{ include "sill.web.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*Selector labels*/}}
{{- define "sill.selectorLabels" -}}
app.kubernetes.io/name: {{ include "sill.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}


{{- define "sill.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "sill.api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "sill.web.selectorLabels" -}}
app.kubernetes.io/name: {{ include "sill.web.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*Create the name of the service account to use*/}}

{{- define "sill.api.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "sill.api.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "sill.web.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (include "sill.web.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}
