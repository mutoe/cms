import { AxiosError, AxiosRequestConfig, Method } from 'axios'
import React, { useState } from 'react'
import { FormRef } from 'src/components/FormRenderer'
import { fieldErrorDecorator, focusErrorField, FormExceptionKey } from 'src/utils/form.util'
import { ConfigInterface, SWRConfig } from 'swr'
import { PontCore } from './pontCore'

const defaultOptions: ConfigInterface = {
  shouldRetryOnError: false,
  revalidateOnFocus: false,
  dedupingInterval: 60000,
}

export const SWRProvider: React.FC<ConfigInterface> = props => {
  const { children, ...options } = props

  return (
    <SWRConfig value={{ ...defaultOptions, ...options }}>
      {children}
    </SWRConfig>
  )
}

// export function useRequest<D = any> (
//   url: string,
//   params: any = {},
//   swrOptions: ConfigInterface = {},
//   axiosOption: AxiosRequestConfig = {},
// ) {
//   const method = axiosOption?.method || 'GET'
//   const fetcher = (url: string) => PontCore.fetch<D>({ url, method, ...axiosOption })
//
//   const urlKey = getUrlKey(url, params)
//   const { data, error, isValidating, mutate } = useSWR<D>(urlKey, fetcher, swrOptions)
//
//   return {
//     data,
//     error,
//     mutate,
//     loading: data === undefined || isValidating,
//   }
// }

export type FormErrorResponse = Record<string, FormExceptionKey[]>
export function isFormError (error: any): error is AxiosError<FormErrorResponse> {
  return error.response?.status === 422 && error.response.data
}

export function useSubmit<Req = any, Res = any> (formRef: FormRef, method: Method, path: string, params?: any) {
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data: Req) => {
    const axiosOption: AxiosRequestConfig = { url: PontCore.injectPathVariables(path, params), method, data }
    try {
      setSubmitting(true)
      return await PontCore.fetch<Res>(axiosOption)
    } catch (e) {
      if (formRef && isFormError(e)) {
        Object.entries(e.response?.data ?? {})
          .forEach(([field, message]) => formRef.current?.setError(field, fieldErrorDecorator(field, message)))
        focusErrorField()
      }
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  return {
    submitting,
    onSubmit,
  }
}

// export function getUrlKey (url: any, params = {} as any) {
//   const urlKey =
//     typeof params === 'function'
//       ? () => {
//         return params ? PontCore.getUrl(url, params()) : null
//       }
//       : params
//         ? PontCore.getUrl(url, params)
//         : null
//
//   return urlKey
// }
