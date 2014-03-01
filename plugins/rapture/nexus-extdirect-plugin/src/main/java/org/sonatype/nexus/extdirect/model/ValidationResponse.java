/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2007-2013 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.extdirect.model;

import java.util.List;
import java.util.Map;

import org.sonatype.configuration.validation.ValidationMessage;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Ext.Direct validation response.
 *
 * @since 2.8
 */
public class ValidationResponse
    extends Response<Object>
{
  private List<String> messages;

  private Map<String, String> errors;

  public ValidationResponse(List<ValidationMessage> validationMessages) {
    super(false, Lists.newArrayList());
    if (validationMessages != null) {
      errors = Maps.newHashMap();
      for (ValidationMessage validationMessage : validationMessages) {
        if ("*".equals(validationMessage.getKey())) {
          if (messages == null) {
            messages = Lists.newArrayList();
          }
          messages.add(validationMessage.getMessage());
        }
        else {
          errors.put(validationMessage.getKey(), validationMessage.getMessage());
        }
      }
    }
  }
}
